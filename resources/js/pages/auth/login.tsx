import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { home, register } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store JWT token
            localStorage.setItem('jwt_token', data.access_token);
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Log In" />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 px-4">
                <div className="w-full max-w-md">
                    {/* Logo/Brand */}
                    <div className="mb-8 text-center">
                        <Link href={home.url()}>
                            <h1 className="text-3xl font-bold tracking-tight text-primary">
                                AutoPliusMinus
                            </h1>
                        </Link>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Sign in to your account
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome back</CardTitle>
                            <CardDescription>
                                Enter your credentials to access your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>

                                <div className="text-center text-sm">
                                    <span className="text-muted-foreground">
                                        Don't have an account?{' '}
                                    </span>
                                    <Link
                                        href={register.url()}
                                        className="font-semibold text-primary hover:underline"
                                    >
                                        Register
                                    </Link>
                                </div>

                                <div className="text-center">
                                    <Link
                                        href={home.url()}
                                        className="text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        ← Back to home
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Demo credentials */}
                    <Card className="mt-4 border-dashed">
                        <CardContent className="pt-6">
                            <p className="mb-2 text-xs font-semibold text-muted-foreground">
                                Demo Credentials:
                            </p>
                            <div className="space-y-1 text-xs text-muted-foreground">
                                <p>
                                    <strong>Admin:</strong> admin@example.com / password
                                </p>
                                <p>
                                    <strong>User:</strong> user@example.com / password
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

