<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invitation to Finance Tracker</title>
</head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
    <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">You're invited!</h1>
    <p style="color: #555; margin-bottom: 24px;">
        {{ $invitation->invitedBy->name }} has invited you to join their Finance Tracker.
        You'll have <strong>{{ $invitation->permission === \App\Enums\Permission::Edit ? 'full edit' : 'view-only' }}</strong> access.
    </p>

    <a href="{{ $acceptUrl }}"
       style="display: inline-block; background: #0f172a; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
        Accept Invitation
    </a>

    <p style="margin-top: 24px; font-size: 13px; color: #888;">
        This invitation expires on {{ $invitation->expires_at->format('M j, Y') }}.
        If you weren't expecting this, you can ignore this email.
    </p>

    <p style="margin-top: 8px; font-size: 12px; color: #aaa;">
        Or copy this link: {{ $acceptUrl }}
    </p>
</body>
</html>
