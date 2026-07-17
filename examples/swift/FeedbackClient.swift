// Minimal Feedback MCP client for iOS, iPadOS, and macOS.
// Copy into your project and adjust the config.

import Foundation

struct FeedbackClient {
    /// Your instance, e.g. https://feedback.your-domain.com
    let endpoint: URL
    /// Project slug from config/projects/<slug>
    let project: String
    /// The project's ingest key (safe to ship in the binary; it can only submit)
    let ingestKey: String
    /// "ios", "macos", etc. Must be allowed by the project's platforms list.
    let platform: String

    enum FeedbackError: LocalizedError {
        case invalidResponse
        case server(status: Int, message: String?)

        var errorDescription: String? {
            switch self {
            case .invalidResponse:
                return "The feedback server returned an unexpected response."
            case .server(let status, let message):
                return message ?? "The feedback server returned status \(status)."
            }
        }
    }

    struct Submission: Decodable {
        let id: String
        let createdAt: String
    }

    /// Submits feedback. `data` must match the form's field schema.
    /// Pass `userToken` if the project has `auth.jwt` configured.
    @discardableResult
    func submit(
        form: String,
        data: [String: Any],
        metadata: [String: Any] = [:],
        userToken: String? = nil
    ) async throws -> Submission {
        var request = URLRequest(url: endpoint.appendingPathComponent("api/v1/feedback"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(ingestKey, forHTTPHeaderField: "X-Feedback-Key")
        if let userToken {
            request.setValue("Bearer \(userToken)", forHTTPHeaderField: "Authorization")
        }

        var defaultMetadata: [String: Any] = [
            "appVersion": Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") ?? "unknown",
            "build": Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") ?? "unknown",
            "osVersion": ProcessInfo.processInfo.operatingSystemVersionString,
            "locale": Locale.current.identifier,
        ]
        defaultMetadata.merge(metadata) { _, custom in custom }

        request.httpBody = try JSONSerialization.data(withJSONObject: [
            "project": project,
            "form": form,
            "platform": platform,
            "data": data,
            "metadata": defaultMetadata,
        ])

        let (body, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw FeedbackError.invalidResponse
        }
        guard (200..<300).contains(http.statusCode) else {
            let message = (try? JSONSerialization.jsonObject(with: body) as? [String: Any])?["error"] as? String
            throw FeedbackError.server(status: http.statusCode, message: message)
        }

        struct Envelope: Decodable { let feedback: Submission }
        return try JSONDecoder().decode(Envelope.self, from: body).feedback
    }
}

// Usage:
//
// let client = FeedbackClient(
//     endpoint: URL(string: "https://feedback.your-domain.com")!,
//     project: "my-app",
//     ingestKey: "pk_...",
//     platform: "ios"
// )
//
// try await client.submit(
//     form: "bug-report",
//     data: [
//         "title": "Crash on launch",
//         "description": "The app closes immediately after opening.",
//         "severity": "high",
//     ]
// )
