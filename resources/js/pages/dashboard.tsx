import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    credits: number;
};

type Listing = {
    id: number;
    user_id: number;
    title: string;
    description: string;
    price: number;
    mileage: number;
    color: string;
    status: string;
    car_model?: {
        id: number;
        name: string;
        year: number;
        brand?: {
            id: number;
            name: string;
        };
    };
    created_at: string;
};

type CarModel = {
    id: number;
    name: string;
    year: number;
    brand_id: number;
};

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [carModels, setCarModels] = useState<CarModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [viewingListing, setViewingListing] = useState<Listing | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        mileage: '',
        color: '',
        car_model_id: '',
    });

    // Check authentication
    useEffect(() => {
        if (!isAuthenticated()) {
            window.location.href = '/login';
            return;
        }

        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [userData, listingsRes, carModelsRes] = await Promise.all([
                getCurrentUser(),
                fetchWithAuth('/api/listings'),
                fetch('/api/car-models'),
            ]);

            setUser(userData);

            if (listingsRes.ok) {
                const listingsData = await listingsRes.json();
                // Filter to show only user's own listings
                const userListings = Array.isArray(listingsData)
                    ? listingsData.filter((l: Listing) => l.user_id === userData.id)
                    : [];
                setListings(userListings);
            }

            if (carModelsRes.ok) {
                setCarModels(await carModelsRes.json());
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateListing = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetchWithAuth('/api/listings', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    mileage: parseInt(formData.mileage),
                    car_model_id: parseInt(formData.car_model_id),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create listing');
            }

            setCreateDialogOpen(false);
            setFormData({
                title: '',
                description: '',
                price: '',
                mileage: '',
                color: '',
                car_model_id: '',
            });
            loadData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to create listing');
        }
    };

    const handleUpdateStatus = async (listingId: number, newStatus: string) => {
        try {
            const response = await fetchWithAuth(`/api/listings/${listingId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            loadData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update status');
        }
    };

    const handleDeleteListing = async (listingId: number) => {
        if (!confirm('Are you sure you want to delete this listing?')) {
            return;
        }

        try {
            const response = await fetchWithAuth(`/api/listings/${listingId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete listing');
            }

            loadData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete listing');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-secondary/20">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                        <Link href={home.url()} className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight text-primary">
                                AutoPliusMinus
                            </span>
                            <span className="text-xs text-muted-foreground">Dashboard</span>
                        </Link>
                        <nav className="flex items-center gap-3">
                            <Link href={home.url()}>
                                <Button size="sm" variant="ghost">
                                    Home
                                </Button>
                            </Link>
                            {user?.role === 'admin' && (
                                <Link href="/admin">
                                    <Button size="sm" variant="default">
                                        Admin Panel
                                    </Button>
                                </Link>
                            )}
                            <Link href="/profile">
                                <Button size="sm" variant="ghost">
                                    Profile
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Welcome back, {user?.name}!
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Manage your car listings and profile
                            </p>
                        </div>
                        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg">
                                    <svg
                                        className="mr-2 h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                    Create Listing
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create New Listing</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateListing} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData({ ...formData, title: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    description: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price (€)</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, price: e.target.value })
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mileage">Mileage (km)</Label>
                                            <Input
                                                id="mileage"
                                                type="number"
                                                value={formData.mileage}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, mileage: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="color">Color</Label>
                                            <Input
                                                id="color"
                                                value={formData.color}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, color: e.target.value })
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="car_model">Car Model</Label>
                                            <Select
                                                value={formData.car_model_id}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, car_model_id: value })
                                                }
                                            >
                                                <SelectTrigger id="car_model">
                                                    <SelectValue placeholder="Select model" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {carModels.map((model) => (
                                                        <SelectItem
                                                            key={model.id}
                                                            value={String(model.id)}
                                                        >
                                                            {model.name} ({model.year})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full">
                                        Create Listing
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Listings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{listings.length}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Approved
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {listings.filter((l) => l.status === 'approved').length}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Pending
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {listings.filter((l) => l.status === 'pending').length}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Listings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>My Listings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            {listings.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        You haven't created any listings yet.
                                    </p>
                                    <Button
                                        className="mt-4"
                                        onClick={() => setCreateDialogOpen(true)}
                                    >
                                        Create Your First Listing
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {listings.map((listing) => (
                                        <div
                                            key={listing.id}
                                            className="flex items-center justify-between rounded-lg border p-4"
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{listing.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {listing.car_model?.brand?.name}{' '}
                                                    {listing.car_model?.name} · €
                                                    {listing.price.toLocaleString()}
                                                </p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                            listing.status === 'approved'
                                                                ? 'bg-green-100 text-green-700'
                                                                : listing.status === 'pending'
                                                                  ? 'bg-yellow-100 text-yellow-700'
                                                                  : listing.status === 'rejected'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : listing.status === 'sold'
                                                                      ? 'bg-gray-100 text-gray-700'
                                                                      : 'bg-blue-100 text-blue-700'
                                                        }`}
                                                    >
                                                        {listing.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {listing.status === 'approved' && (
                                                    <>
                                                        <Select
                                                            value={listing.status}
                                                            onValueChange={(value) =>
                                                                handleUpdateStatus(listing.id, value)
                                                            }
                                                        >
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="approved">
                                                                    Approved
                                                                </SelectItem>
                                                                <SelectItem value="sold">
                                                                    Sold
                                                                </SelectItem>
                                                                <SelectItem value="reserved">
                                                                    Reserved
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setViewingListing(listing)}
                                                >
                                                    View
                                                </Button>
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

                    {/* View Listing Modal */}
                    <Dialog open={!!viewingListing} onOpenChange={(open) => !open && setViewingListing(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl">
                                    {viewingListing?.title}
                                </DialogTitle>
                            </DialogHeader>
                            
                            {viewingListing && (
                                <div className="space-y-6">
                                    {/* Image */}
                                    <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                                        <img
                                            src="https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800"
                                            alt={viewingListing.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Status:</span>
                                        <span
                                            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                                viewingListing.status === 'approved'
                                                    ? 'bg-green-100 text-green-700'
                                                    : viewingListing.status === 'pending'
                                                      ? 'bg-yellow-100 text-yellow-700'
                                                      : viewingListing.status === 'rejected'
                                                        ? 'bg-red-100 text-red-700'
                                                        : viewingListing.status === 'sold'
                                                          ? 'bg-gray-100 text-gray-700'
                                                          : 'bg-blue-100 text-blue-700'
                                            }`}
                                        >
                                            {viewingListing.status.charAt(0).toUpperCase() + viewingListing.status.slice(1)}
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="text-3xl font-bold text-primary">
                                        €{viewingListing.price.toLocaleString()}
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-lg border bg-muted/30 p-4">
                                            <p className="text-xs text-muted-foreground">Brand</p>
                                            <p className="mt-1 font-semibold">
                                                {viewingListing.car_model?.brand?.name ?? 'Unknown'}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-muted/30 p-4">
                                            <p className="text-xs text-muted-foreground">Model</p>
                                            <p className="mt-1 font-semibold">
                                                {viewingListing.car_model?.name ?? 'Unknown'}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-muted/30 p-4">
                                            <p className="text-xs text-muted-foreground">Year</p>
                                            <p className="mt-1 font-semibold">
                                                {viewingListing.car_model?.year ?? 'N/A'}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-muted/30 p-4">
                                            <p className="text-xs text-muted-foreground">Mileage</p>
                                            <p className="mt-1 font-semibold">
                                                {viewingListing.mileage.toLocaleString()} km
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-muted/30 p-4">
                                            <p className="text-xs text-muted-foreground">Color</p>
                                            <p className="mt-1 font-semibold">
                                                {viewingListing.color}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-muted/30 p-4">
                                            <p className="text-xs text-muted-foreground">Created</p>
                                            <p className="mt-1 font-semibold">
                                                {new Date(viewingListing.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                                            Description
                                        </h4>
                                        <p className="text-sm">
                                            {viewingListing.description}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 border-t pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setViewingListing(null)}
                                            className="flex-1"
                                        >
                                            Close
                                        </Button>
                                        <Link href={`/listings/${viewingListing.id}`} className="flex-1">
                                            <Button className="w-full">
                                                View Full Listing
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </>
    );
}
