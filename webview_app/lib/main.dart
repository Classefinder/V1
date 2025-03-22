import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:io' show Platform;

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter WebView',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const WebViewScreen(),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  _WebViewScreenState createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _requestLocationPermission();
    _initializeWebViewController();
  }

  Future<void> _requestLocationPermission() async {
    if (Platform.isAndroid) {
      await Permission.location.request();
    }
  }

  void _initializeWebViewController() {
    _controller =
        WebViewController()
          ..setJavaScriptMode(JavaScriptMode.unrestricted)
          ..setNavigationDelegate(
            NavigationDelegate(
              onProgress: (int progress) {
                print('Loading: $progress%');
              },
              onPageStarted: (String url) {
                setState(() {
                  _isLoading = true;
                });
              },
              onPageFinished: (String url) {
                setState(() {
                  _isLoading = false;
                });
              },
              onWebResourceError: (WebResourceError error) {
                print('''
            Error code: ${error.errorCode}
            Description: ${error.description}
            Error type: ${error.errorType}
            ''');
              },
              onNavigationRequest: (NavigationRequest request) {
                // Autoriser toutes les navigations
                return NavigationDecision.navigate;
              },
            ),
          )
          ..setBackgroundColor(Colors.white)
          ..enableZoom(false)
          ..loadRequest(
            Uri.parse('https://classefinder.duckdns.org'),
            headers: {'Cache-Control': 'no-cache'},
          );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('WebView Flutter'),
        actions: [
          IconButton(
            icon: const Icon(Icons.replay),
            onPressed: () => _controller.reload(),
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading) const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
