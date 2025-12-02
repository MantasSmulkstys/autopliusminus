import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/ui/header';
import { home, login, register } from '@/routes';
import listings from '@/routes/listings';
import comments from '@/routes/comments';
import { isAuthenticated, fetchWithAuth, getCurrentUser } from '@/lib/api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';

type Listing = {
    id: number;
    title: string;
    description: string;
    price: number;
    mileage: number;
    color: string;
    status: string;
    created_at: string;
    car_model?: {
        id: number;
        name: string;
        year: number;
        description?: string;
        brand?: {
            id: number;
            name: string;
            description?: string;
        };
    };
    user?: {
        id: number;
        name: string;
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
};

export default function ListingShow({ id }: { id: number }) {
    const [listing, setListing] = useState<Listing | null>(null);
    const [commentsData, setCommentsData] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // Comment form state
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Check if user is logged in and get user info
    useEffect(() => {
        const checkAuth = async () => {
            const authenticated = isAuthenticated();
            setIsLoggedIn(authenticated);
            
            if (authenticated) {
                try {
                    const user = await getCurrentUser();
                    setCurrentUserId(user.id);
                    setIsAdmin(user.role === 'admin');
                } catch (err) {
                    console.error('Failed to get user:', err);
                }
            }
        };
        
        checkAuth();
    }, []);

    // Load listing details
    useEffect(() => {
        const fetchListing = async () => {
            try {
                setLoading(true);
                setError(null);

                // Use apiShow if available, otherwise fallback to show
                const routeFn = (listings.apiShow && typeof listings.apiShow === 'function') 
                    ? listings.apiShow 
                    : (listings.show && typeof listings.show === 'function')
                    ? listings.show
                    : null;
                
                if (!routeFn) {
                    console.error('Route function not available. listings object:', listings);
                    throw new Error('Route function not available.');
                }

                const res = await fetch(routeFn(id).url, {
                    credentials: 'include',
                });

                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error('Listing not found');
                    }
                    throw new Error('Failed to load listing');
                }

                const data = await res.json();
                setListing(data);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        void fetchListing();
    }, [id]);

    // Load comments for this listing
    const loadComments = useCallback(async () => {
        try {
            const res = await fetch(comments.byListing({ listingId: id }).url, {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setCommentsData(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Failed to load comments:', e);
        }
    }, [id]);

    useEffect(() => {
        void loadComments();
    }, [loadComments]);

    // Handle create comment
    const handleCreateComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetchWithAuth('/api/comments', {
                method: 'POST',
                body: JSON.stringify({
                    listing_id: id,
                    content: newComment,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create comment');
            }

            setNewComment('');
            await loadComments();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to create comment');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle edit comment
    const handleEditComment = async (commentId: number) => {
        if (!editingCommentText.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetchWithAuth(`/api/comments/${commentId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    content: editingCommentText,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update comment');
            }

            setEditingCommentId(null);
            setEditingCommentText('');
            await loadComments();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update comment');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete comment (user deletes own comment)
    const handleDeleteComment = async (commentId: number) => {
        if (!confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            const response = await fetchWithAuth(`/api/comments/${commentId}`, {
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

    // Handle admin delete comment
    const handleAdminDeleteComment = async (commentId: number) => {
        if (!confirm('Are you sure you want to delete this comment? (Admin action)')) {
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

    // Start editing a comment
    const startEditing = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentText(comment.content);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <>
            <Head title={listing?.title ?? 'Listing Details'} />
            <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-secondary/20">
                {/* Header with responsive hamburger menu */}
                <Header />

                {/* Main content */}
                <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8">
                    {error ? (
                        <Card>
                            <CardContent className="py-16 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                                    <svg
                                        className="h-8 w-8 text-destructive"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">{error}</h3>
                                <Link href={home()}>
                                    <Button className="mt-4" variant="default">
                                        Back to Home
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : loading ? (
                        <div className="space-y-8">
                            <Card className="animate-pulse">
                                <div className="aspect-video bg-muted" />
                                <CardHeader>
                                    <div className="h-8 w-3/4 rounded bg-muted" />
                                    <div className="h-4 w-1/2 rounded bg-muted" />
                                </CardHeader>
                                <CardContent>
                                    <div className="h-4 w-full rounded bg-muted" />
                                    <div className="mt-2 h-4 w-full rounded bg-muted" />
                                    <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
                                </CardContent>
                            </Card>
                        </div>
                    ) : listing ? (
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Main listing details */}
                            <div className="lg:col-span-2">
                                <Card className="overflow-hidden">
                                    {/* Image */}
                                    <div className="relative aspect-video overflow-hidden bg-muted">
                                        <img
                                            src="https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=1200"
                                            alt={listing.title}
                                            className="h-full w-full object-cover"
                                        />
                                        {listing.status === 'sold' && (
                                            <div className="absolute right-4 top-4 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                                                Sold
                                            </div>
                                        )}
                                        {listing.status === 'reserved' && (
                                            <div className="absolute right-4 top-4 rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                                                Reserved
                                            </div>
                                        )}
                                    </div>

                                    {/* Title and price */}
                                    <CardHeader className="border-b">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-3xl">
                                                    {listing.title}
                                                </CardTitle>
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    Listed on {formatDate(listing.created_at)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold text-primary">
                                                    €{listing.price.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {/* Description */}
                                    <CardContent className="space-y-6 pt-6">
                                        <div>
                                            <h3 className="mb-2 text-lg font-semibold">
                                                Description
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {listing.description}
                                            </p>
                                        </div>

                                        {/* Specifications */}
                                        <div>
                                            <h3 className="mb-4 text-lg font-semibold">
                                                Specifications
                                            </h3>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="rounded-lg border border-border bg-muted/30 p-4">
                                                    <p className="text-xs text-muted-foreground">
                                                        Brand
                                                    </p>
                                                    <p className="mt-1 font-semibold">
                                                        {listing.car_model?.brand?.name ??
                                                            'Unknown'}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg border border-border bg-muted/30 p-4">
                                                    <p className="text-xs text-muted-foreground">
                                                        Model
                                                    </p>
                                                    <p className="mt-1 font-semibold">
                                                        {listing.car_model?.name ?? 'Unknown'}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg border border-border bg-muted/30 p-4">
                                                    <p className="text-xs text-muted-foreground">
                                                        Year
                                                    </p>
                                                    <p className="mt-1 font-semibold">
                                                        {listing.car_model?.year ?? 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg border border-border bg-muted/30 p-4">
                                                    <p className="text-xs text-muted-foreground">
                                                        Mileage
                                                    </p>
                                                    <p className="mt-1 font-semibold">
                                                        {listing.mileage.toLocaleString()} km
                                                    </p>
                                                </div>
                                                <div className="rounded-lg border border-border bg-muted/30 p-4">
                                                    <p className="text-xs text-muted-foreground">
                                                        Color
                                                    </p>
                                                    <p className="mt-1 font-semibold">
                                                        {listing.color}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg border border-border bg-muted/30 p-4">
                                                    <p className="text-xs text-muted-foreground">
                                                        Status
                                                    </p>
                                                    <p className="mt-1 font-semibold capitalize">
                                                        {listing.status}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Comments Section */}
                                <Card className="mt-8">
                                    <CardHeader>
                                        <CardTitle className="text-xl">
                                            Comments ({commentsData.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Create Comment Form */}
                                        {isLoggedIn ? (
                                            <form onSubmit={handleCreateComment} className="space-y-3">
                                                <textarea
                                                    className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    placeholder="Write a comment..."
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    disabled={submitting}
                                                />
                                                <Button type="submit" disabled={submitting || !newComment.trim()}>
                                                    {submitting ? 'Posting...' : 'Post Comment'}
                                                </Button>
                                            </form>
                                        ) : (
                                            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                                                <p className="text-sm text-muted-foreground">
                                                    Please{' '}
                                                    <Link
                                                        href={login.url()}
                                                        className="font-semibold text-primary hover:underline"
                                                    >
                                                        log in
                                                    </Link>{' '}
                                                    or{' '}
                                                    <Link
                                                        href={register.url()}
                                                        className="font-semibold text-primary hover:underline"
                                                    >
                                                        register
                                                    </Link>{' '}
                                                    to leave a comment
                                                </p>
                                            </div>
                                        )}

                                        {/* Comments List */}
                                        {commentsData.length === 0 ? (
                                            <div className="py-8 text-center text-sm text-muted-foreground">
                                                No comments yet. Be the first to comment!
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {commentsData.map((comment) => (
                                                    <div
                                                        key={comment.id}
                                                        className="rounded-lg border border-border bg-card p-4"
                                                    >
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <p className="font-semibold">
                                                                {comment.user?.name ?? 'Anonymous'}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatDate(comment.created_at)}
                                                                </p>
                                                                {/* Edit/Delete buttons for own comments or admin */}
                                                                {(currentUserId === comment.user?.id || isAdmin) && (
                                                                    <div className="flex gap-1">
                                                                        {currentUserId === comment.user?.id && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                onClick={() => startEditing(comment)}
                                                                                disabled={submitting}
                                                                            >
                                                                                Edit
                                                                            </Button>
                                                                        )}
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => 
                                                                                isAdmin && currentUserId !== comment.user?.id
                                                                                    ? handleAdminDeleteComment(comment.id)
                                                                                    : handleDeleteComment(comment.id)
                                                                            }
                                                                            disabled={submitting}
                                                                        >
                                                                            Delete
                                                                            {isAdmin && currentUserId !== comment.user?.id && ' (Admin)'}
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Edit mode */}
                                                        {editingCommentId === comment.id ? (
                                                            <div className="space-y-2">
                                                                <Input
                                                                    value={editingCommentText}
                                                                    onChange={(e) => setEditingCommentText(e.target.value)}
                                                                    disabled={submitting}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleEditComment(comment.id)}
                                                                        disabled={submitting || !editingCommentText.trim()}
                                                                    >
                                                                        {submitting ? 'Saving...' : 'Save'}
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={cancelEditing}
                                                                        disabled={submitting}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">
                                                                {comment.content}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Seller info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Seller</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                                                {listing.user?.name?.[0]?.toUpperCase() ?? 'U'}
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    {listing.user?.name ?? 'Unknown'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Verified seller
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Contact CTA */}
                                {!isLoggedIn && (
                                    <Card className="border-primary/50 bg-primary/5">
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                Interested?
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-muted-foreground">
                                                Register to contact the seller and get more details
                                                about this listing.
                                            </p>
                                            <Link href={register.url()} className="block">
                                                <Button className="w-full" size="lg">
                                                    Register Now
                                                </Button>
                                            </Link>
                                            <Link href={login.url()} className="block">
                                                <Button
                                                    className="w-full"
                                                    size="lg"
                                                    variant="outline"
                                                >
                                                    Log In
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Back to listings */}
                                <Card>
                                    <CardContent className="pt-6">
                                        <Link href={home()}>
                                            <Button className="w-full" variant="outline">
                                                ← Back to All Listings
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : null}
                </main>

                {/* Footer */}
                <footer className="border-t border-border/70 bg-muted/30">
                    <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-muted-foreground">
                        © 2025 AutoPliusMinus. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}
