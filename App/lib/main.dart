import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (Platform.isAndroid) {
    await InAppWebViewController.setWebContentsDebuggingEnabled(true);
  }
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Carte Interactive',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const WebViewPage(),
    );
  }
}

class WebViewPage extends StatefulWidget {
  const WebViewPage({super.key});

  @override
  State<WebViewPage> createState() => _WebViewPageState();
}

class _WebViewPageState extends State<WebViewPage> {
  final GlobalKey webViewKey = GlobalKey();
  InAppWebViewController? _controller;
  String _lastUrl = 'https://classefinder.duckdns.org/';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initApp();
  }

  Future<void> _initApp() async {
    await _demanderPermissionLocalisation();
    await _loadLastUrl();
  }

  Future<void> _loadLastUrl() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      _lastUrl = prefs.getString('lastUrl') ?? _lastUrl;
    });
  }

  Future<void> _saveLastUrl(String url) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('lastUrl', url);
  }

  // [Même méthode _demanderPermissionLocalisation() que précédemment]

  Future<void> _showUrlDialog() async {
    String newUrl =
        await showDialog<String>(
          context: context,
          builder:
              (context) => AlertDialog(
                title: const Text('Changer d\'URL'),
                content: TextField(
                  autofocus: true,
                  decoration: const InputDecoration(
                    hintText: 'https://exemple.com',
                  ),
                  onSubmitted: (value) => Navigator.pop(context, value),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context, _lastUrl),
                    child: const Text('Annuler'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context, _lastUrl),
                    child: const Text('OK'),
                  ),
                ],
              ),
        ) ??
        _lastUrl;

    if (newUrl.isNotEmpty) {
      if (!newUrl.startsWith('http')) newUrl = 'https://$newUrl';
      _controller?.loadUrl(urlRequest: URLRequest(url: WebUri(newUrl)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        body: Stack(
          children: [
            InAppWebView(
              key: webViewKey,
              initialUrlRequest: URLRequest(url: WebUri(_lastUrl)),
              initialSettings: InAppWebViewSettings(
                javaScriptEnabled: true,
                supportZoom: true,
                builtInZoomControls: true,
                displayZoomControls: false,
                verticalScrollBarEnabled: true,
                horizontalScrollBarEnabled: true,
                useHybridComposition: true,
                allowsInlineMediaPlayback: true,
                mediaPlaybackRequiresUserGesture: false,
              ),
              onWebViewCreated: (controller) {
                _controller = controller;
                // [Garder le handler de géolocalisation]
              },
              onLoadStart:
                  (controller, url) => setState(() => _isLoading = true),
              onLoadStop: (controller, url) async {
                setState(() => _isLoading = false);
                if (url != null) await _saveLastUrl(url.toString());
              },
              onReceivedError: (controller, request, error) {
                setState(() => _isLoading = false);
              },
            ),
            if (_isLoading) const Center(child: CircularProgressIndicator()),
            Positioned(
              top: 30,
              right: 15,
              child: IconButton(
                icon: const Icon(Icons.settings, size: 30),
                onPressed: _showUrlDialog,
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white.withOpacity(0.8),
                  shape: const CircleBorder(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
