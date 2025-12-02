import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { fetchWithAuth, getCurrentUser, isAuthenticated, logout } from '@/lib/api';
import { home } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_blocked: boolean;
    credits: number;
};

type Listing = {
    id: number;
    user_id: number;
    title: string;
    description: string;
    price: number;
    status: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    car_model?: {
        name: string;
        brand?: {
            name: string;
        };
    };
};

type Comment = {
    id: number;
    content: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
    listing?: {
        id: number;
        title: string;
    };
};

export default function AdminDashboard() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'comments'>('listings');

    // Listings
    const [listings, setListings] = useState<Listing[]>([]);
    const [listingFilter, setListingFilter] = useState<string>('pending');

    // Users
    const [users, setUsers] = useState<User[]>([]);

    // Comments
    const [comments, setComments] = useState<Comment[]>([]);

    // Check authentication and admin role
    useEffect(() => {
        const checkAuth = async () => {
            if (!isAuthenticated()) {
                window.location.href = '/login';
                return;
            }

            try {
                const user = await getCurrentUser();
                
                if (user.role !== 'admin') {
                    alert('Access denied. Admin only.');
                    window.location.href = '/dashboard';
                    return;
                }

                setCurrentUser(user);
                await loadData();
            } catch (err) {
                console.error('Auth error:', err);
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const loadData = async () => {
        await Promise.all([loadListings(), loadUsers(), loadComments()]);
    };

    const loadListings = async () => {
        try {
            const response = await fetchWithAuth('/api/listings');
            if (response.ok) {
                const data = await response.json();
                setListings(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to load listings:', err);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await fetchWithAuth('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to load users:', err);
        }
    };

    const loadComments = async () => {
        try {
            const response = await fetchWithAuth('/api/comments');
            if (response.ok) {
                const data = await response.json();
                setComments(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to load comments:', err);
        }
    };

    // Listing actions
    const handleApproveListing = async (listingId: number) => {
        try {
            const response = await fetchWithAuth(`/api/listings/${listingId}/approve`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                throw new Error('Failed to approve listing');
            }

            await loadListings();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to approve listing');
        }
    };

    const handleRejectListing = async (listingId: number) => {
        const reason = prompt('Rejection reason (optional):');
        
        try {
            const response = await fetchWithAuth(`/api/listings/${listingId}/reject`, {
                method: 'PATCH',
                body: JSON.stringify({ admin_comment: reason }),
            });

            if (!response.ok) {
                throw new Error('Failed to reject listing');
            }

            await loadListings();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to reject listing');
        }
    };

    const handleDeleteListing = async (listingId: number) => {
        if (!confirm('Are you sure you want to delete this listing?')) {
            return;
        }

        try {
            const response = await fetchWithAuth(`/api/admin/listings/${listingId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete listing');
            }

            await loadListings();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete listing');
        }
    };

    // User actions
    const handleBlockUser = async (userId: number) => {
        if (!confirm('Are you sure you want to block this user?')) {
            return;
        }

        try {
            const response = await fetchWithAuth(`/api/admin/users/${userId}/block`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                throw new Error('Failed to block user');
            }

            await loadUsers();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to block user');
        }
    };

    const handleUnblockUser = async (userId: number) => {
        try {
            const response = await fetchWithAuth(`/api/admin/users/${userId}/unblock`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                throw new Error('Failed to unblock user');
            }

            await loadUsers();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to unblock user');
        }
    };

    // Comment actions
    const handleDeleteComment = async (commentId: number) => {
        if (!confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            const response = await fetchWithAuth(`/api/admin/comments/${commentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete comment');
            }

            await loadComments();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete comment');
        }
    };

    const filteredListings = listings.filter((listing) => {
        if (listingFilter === 'all') return true;
        return listing.status === listingFilter;
    });

    const pendingCount = listings.filter((l) => l.status === 'pending').length;
    const approvedCount = listings.filter((l) => l.status === 'approved').length;
    const rejectedCount = listings.filter((l) => l.status === 'rejected').length;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-secondary/20">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                        <Link href={home.url()} className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight text-primary">
                                AutoPliusMinus
                            </span>
                            <span className="text-xs text-muted-foreground">Admin Dashboard</span>
                        </Link>
                        <nav className="flex items-center gap-3">
                            <Link href={home.url()}>
                                <Button size="sm" variant="ghost">
                                    Home
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button size="sm" variant="ghost">
                                    User Dashboard
                                </Button>
                            </Link>
                            <Button size="sm" variant="outline" onClick={logout}>
                                Logout
                            </Button>
                        </nav>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8">
                    {/* Welcome Section */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Manage listings, users, and comments
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Pending Listings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {pendingCount}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Approved Listings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {approvedCount}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Users
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{users.length}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Comments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{comments.length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b">
                        <button
                            className={`px-4 py-2 text-sm font-medium ${
                                activeTab === 'listings'
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => setActiveTab('listings')}
                        >
                            Listings
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium ${
                                activeTab === 'users'
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => setActiveTab('users')}
                        >
                            Users
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium ${
                                activeTab === 'comments'
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => setActiveTab('comments')}
                        >
                            Comments
                        </button>
                    </div>

                    {/* Listings Tab */}
                    {activeTab === 'listings' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Manage Listings</CardTitle>
                                    <Select value={listingFilter} onValueChange={setListingFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                            <SelectItem value="sold">Sold</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filteredListings.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        No listings found
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredListings.map((listing) => (
                                            <div
                                                key={listing.id}
                                                className="flex items-start justify-between rounded-lg border p-4"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">
                                                            {listing.title}
                                                        </h3>
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                                listing.status === 'approved'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : listing.status === 'pending'
                                                                      ? 'bg-yellow-100 text-yellow-700'
                                                                      : listing.status === 'rejected'
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                        >
                                                            {listing.status}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {listing.car_model?.brand?.name}{' '}
                                                        {listing.car_model?.name} · €
                                                        {listing.price.toLocaleString()}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        By: {listing.user?.name} ({listing.user?.email})
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    {listing.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() =>
                                                                    handleApproveListing(listing.id)
                                                                }
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    handleRejectListing(listing.id)
                                                                }
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Link href={`/listings/${listing.id}`}>
                                                        <Button size="sm" variant="ghost">
                                                            View
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeleteListing(listing.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Users</CardTitle>
                                <CardDescription>
                                    Block or unblock users from the platform
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {users.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between rounded-lg border p-4"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold">{user.name}</p>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({user.role})
                                                    </span>
                                                    {user.is_blocked && (
                                                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                                            Blocked
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Credits: {user.credits}
                                                </p>
                                            </div>

                                            {user.role !== 'admin' && (
                                                <div className="flex gap-2">
                                                    {user.is_blocked ? (
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => handleUnblockUser(user.id)}
                                                        >
                                                            Unblock
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleBlockUser(user.id)}
                                                        >
                                                            Block
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Comments Tab */}
                    {activeTab === 'comments' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Comments</CardTitle>
                                <CardDescription>
                                    Delete inappropriate comments
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {comments.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        No comments found
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {comments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className="flex items-start justify-between rounded-lg border p-4"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold">
                                                            {comment.user?.name ?? 'Anonymous'}
                                                        </p>
                                                        <span className="text-xs text-muted-foreground">
                                                            on {comment.listing?.title}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {comment.content}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    {comment.listing && (
                                                        <Link href={`/listings/${comment.listing.id}`}>
                                                            <Button size="sm" variant="ghost">
                                                                View
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </>
    );
}

