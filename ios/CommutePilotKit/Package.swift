// swift-tools-version:5.10
import PackageDescription

// CommutePilotKit is the platform-independent core of CommutePilot: session
// document models, the player queue state machine, and the Tier-1 voice
// intent grammar. It deliberately has ZERO dependency on AVFoundation, UIKit,
// or SwiftUI so the whole thing (including the state machine that is "the
// heart of the app" per docs/brief/02_ARCHITECTURE.md) can be unit tested on
// any platform, including plain `swift test` on Linux/CI, without a
// simulator or real device.
let package = Package(
    name: "CommutePilotKit",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "CommutePilotKit",
            targets: ["CommutePilotKit"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "CommutePilotKit",
            dependencies: [],
            swiftSettings: [
                .swiftLanguageMode(.v5)
            ]
        ),
        .testTarget(
            name: "CommutePilotKitTests",
            dependencies: ["CommutePilotKit"],
            resources: [
                // Exact copy of data/session.json (v1) from the repo root.
                // Keep this in sync manually when the fixture at
                // data/session.json changes; SessionModelsTests decodes it
                // to prove the models match the real document byte-for-byte.
                .copy("Fixtures/session_fixture.json")
            ]
        )
    ]
)
