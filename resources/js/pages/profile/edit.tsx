import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type Auth } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { type FormEvent, type ReactNode } from 'react';

export default function ProfileEdit() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;

    const profileForm = useForm({
        name: user.name,
        email: user.email,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function handleProfileSubmit(e: FormEvent) {
        e.preventDefault();
        profileForm.put('/profile');
    }

    function handlePasswordSubmit(e: FormEvent) {
        e.preventDefault();
        passwordForm.put('/profile', {
            onSuccess: () => passwordForm.reset(),
        });
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
                <p className="text-muted-foreground text-sm">Manage your account information.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your name and email address.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                autoComplete="name"
                            />
                            {profileForm.errors.name && <p className="text-destructive text-sm">{profileForm.errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profileForm.data.email}
                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                autoComplete="email"
                            />
                            {profileForm.errors.email && <p className="text-destructive text-sm">{profileForm.errors.email}</p>}
                        </div>

                        <Button type="submit" disabled={profileForm.processing}>
                            {profileForm.processing ? 'Saving…' : 'Save changes'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Ensure your account is using a secure password.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current_password">Current Password</Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                autoComplete="current-password"
                            />
                            {passwordForm.errors.current_password && (
                                <p className="text-destructive text-sm">{passwordForm.errors.current_password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new_password">New Password</Label>
                            <Input
                                id="new_password"
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                autoComplete="new-password"
                            />
                            {passwordForm.errors.password && <p className="text-destructive text-sm">{passwordForm.errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>

                        <Button type="submit" disabled={passwordForm.processing}>
                            {passwordForm.processing ? 'Updating…' : 'Update password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

ProfileEdit.layout = (page: ReactNode) => <AppLayout breadcrumb="Profile">{page}</AppLayout>;
