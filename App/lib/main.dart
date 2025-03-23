import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (Platform.isAndroid) {
    // Activation du debugging pour Android via la méthode recommandée
    await InAppWebViewController.setWebContentsDebuggingEnabled(true);
  }
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WebView avec géolocalisation',
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
  InAppWebViewController?
  _controller; // Ce contrôleur pourra être utilisé pour des interactions futures
  String _lastUrl = 'https://classefinder.duckdns.org/';

  @override
  void initState() {
    super.initState();
    _demanderPermissionLocalisation();
    _loadLastUrl();
  }

  Future<void> _loadLastUrl() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      _lastUrl =
          prefs.getString('lastUrl') ?? 'https://classefinder.duckdns.org/';
    });
  }

  Future<void> _saveLastUrl(String url) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('lastUrl', url);
  }

  Future<void> _demanderPermissionLocalisation() async {
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        _showPermissionDeniedPopup();
      }
    }
  }

  void _showPermissionDeniedPopup() {
    showDialog(
      context: context,
      builder: (context) {
        return Platform.isIOS
            ? CupertinoAlertDialog(
              title: const Text("Accès refusé"),
              content: const Text(
                "L'accès à la localisation est nécessaire pour utiliser cette application.",
              ),
              actions: [
                CupertinoDialogAction(
                  child: const Text("OK"),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            )
            : AlertDialog(
              title: const Text("Accès refusé"),
              content: const Text(
                "L'accès à la localisation est nécessaire pour utiliser cette application.",
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text("OK"),
                ),
              ],
            );
      },
    );
  }

  void _showErrorPopup() {
    showDialog(
      context: context,
      builder: (context) {
        return Platform.isIOS
            ? CupertinoAlertDialog(
              title: const Text("Erreur de connexion"),
              content: const Text("Vérifiez votre connexion internet."),
              actions: [
                CupertinoDialogAction(
                  child: const Text("OK"),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            )
            : AlertDialog(
              title: const Text("Erreur de connexion"),
              content: const Text("Vérifiez votre connexion internet."),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text("OK"),
                ),
              ],
            );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: InAppWebView(
          initialUrlRequest: URLRequest(url: WebUri(_lastUrl)),
          onWebViewCreated: (controller) {
            _controller = controller;
          },
          onLoadStop: (controller, url) async {
            await _saveLastUrl(url.toString());
          },
          onReceivedError: (controller, request, error) {
            _showErrorPopup();
          },
          // Autoriser la géolocalisation dans le contenu web
          onGeolocationPermissionsShowPrompt: (controller, origin) async {
            return GeolocationPermissionShowPromptResponse(
              origin: origin,
              allow: true,
              retain: false,
            );
          },
        ),
      ),
    );
  }
}
