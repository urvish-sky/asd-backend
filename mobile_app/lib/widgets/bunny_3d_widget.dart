import 'package:flutter/material.dart';
import 'package:flutter_3d_controller/flutter_3d_controller.dart';

class Bunny3DWidget extends StatefulWidget {
  final Flutter3DController? controller;
  final double height;
  final String? animationToPlay;
  final bool autoPlay;

  const Bunny3DWidget({
    Key? key,
    this.controller,
    this.height = 240,
    this.animationToPlay,
    this.autoPlay = true,
  }) : super(key: key);

  @override
  State<Bunny3DWidget> createState() => _Bunny3DWidgetState();
}

class _Bunny3DWidgetState extends State<Bunny3DWidget> {
  late Flutter3DController _controller;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? Flutter3DController();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.animationToPlay != null) {
        try {
          _controller.playAnimation(animationName: widget.animationToPlay!);
        } catch (_) {}
      }
    });
  }

  @override
  void didUpdateWidget(covariant Bunny3DWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.animationToPlay != oldWidget.animationToPlay && widget.animationToPlay != null) {
      try {
        _controller.playAnimation(animationName: widget.animationToPlay!);
      } catch (_) {}
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: widget.height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          colors: [Color(0xFFE6FFFA), Color(0xFFEBF8FF), Color(0xFFF7FAFC)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        border: Border.all(color: const Color(0xFFB2F5EA), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF319795).withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Flutter3DViewer(
              controller: _controller,
              src: 'assets/bunny.glb',
            ),

            // Top Badge
            Positioned(
              top: 12,
              left: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF81E6D9)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text("🐰 ", style: TextStyle(fontSize: 12)),
                    Text(
                      "Bunny AI Guide",
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF234E52),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
