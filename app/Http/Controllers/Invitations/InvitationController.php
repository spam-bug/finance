<?php

namespace App\Http\Controllers\Invitations;

use App\Data\Invitations\CreateInvitationData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Invitations\AcceptInvitationRequest;
use App\Http\Requests\Invitations\StoreInvitationRequest;
use App\Jobs\Invitations\AcceptInvitation;
use App\Jobs\Invitations\SendInvitation;
use App\Models\Invitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function index(): Response
    {
        $invitations = auth()->user()
            ->sentInvitations()
            ->latest()
            ->get();

        return Inertia::render('invitations/index', [
            'invitations' => $invitations,
        ]);
    }

    public function store(StoreInvitationRequest $request): RedirectResponse
    {
        SendInvitation::dispatch(
            user: $request->user(),
            data: CreateInvitationData::from($request->validated()),
        );

        return redirect()->back()->with('success', 'Invitation sent.');
    }

    public function destroy(Invitation $invitation): RedirectResponse
    {
        $this->authorize('delete', $invitation);

        $invitation->delete();

        return redirect()->back()->with('success', 'Invitation revoked.');
    }

    public function showAccept(string $token): Response|RedirectResponse
    {
        $invitation = Invitation::query()
            ->where('token', $token)
            ->with('invitedBy')
            ->firstOrFail();

        if ($invitation->isAccepted()) {
            return redirect()->route('login')->with('status', 'This invitation has already been accepted.');
        }

        if ($invitation->isExpired()) {
            return redirect()->route('login')->with('status', 'This invitation has expired.');
        }

        return Inertia::render('auth/register', [
            'token' => $token,
            'email' => $invitation->email,
            'inviterName' => $invitation->invitedBy->name,
        ]);
    }

    public function accept(AcceptInvitationRequest $request, string $token): RedirectResponse
    {
        $invitation = Invitation::query()
            ->where('token', $token)
            ->firstOrFail();

        if ($invitation->isAccepted() || $invitation->isExpired()) {
            return redirect()->route('login')->with('status', 'This invitation is no longer valid.');
        }

        AcceptInvitation::dispatchSync(
            invitation: $invitation,
            name: $request->validated('name'),
            password: $request->validated('password'),
        );

        $user = \App\Models\User::query()->where('email', $invitation->email)->firstOrFail();
        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
