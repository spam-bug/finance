import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: 'test@example.com',
        password: 'password',
        remember: false as boolean,
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/login');
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm space-y-4">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Finance Tracker</h1>
                    <p className="text-muted-foreground text-sm">Sign in to your account</p>
                </div>

                {status && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{status}</div>}

                <Card>
                    <CardHeader>
                        <CardTitle>Sign in</CardTitle>
                        <CardDescription>Enter your email and password to continue.</CardDescription>
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

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="/forgot-password" className="text-sm underline-offset-4 hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked === true)}
                                />
                                <Label htmlFor="remember" className="cursor-pointer font-normal">
                                    Remember me
                                </Label>
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Signing in…' : 'Sign in'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-muted-foreground text-center text-sm">
                    Don't have an account?{' '}
                    <Link href="/register" className="underline-offset-4 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
