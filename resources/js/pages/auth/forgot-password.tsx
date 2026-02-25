import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

interface ForgotPasswordProps {
    status?: string;
}

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/forgot-password');
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm space-y-4">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Finance Tracker</h1>
                </div>

                {status && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{status}</div>}

                <Card>
                    <CardHeader>
                        <CardTitle>Reset password</CardTitle>
                        <CardDescription>Enter your email address and we will send you a link to reset your password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    autoFocus
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@example.com"
                                />
                                {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Sending…' : 'Send reset link'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-muted-foreground text-center text-sm">
                    <Link href="/login" className="underline-offset-4 hover:underline">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
