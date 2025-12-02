import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Header } from '@/components/ui/header';
import { login, register } from '@/routes';
import listings from '@/routes/listings';
import brands from '@/routes/brands';
import carModels from '@/routes/car-models';
import { isAuthenticated } from '@/lib/api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Listing = {
    id: number;
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
    user?: {
        id: number;
        name: string;
    };
};

type Brand = {
    id: number;
    name: string;
    description?: string;
};

type CarModel = {
    id: number;
    name: string;
    year: number;
    brand_id: number;
    brand?: Brand;
};

export default function Welcome() {
    const [listingsData, setListingsData] = useState<Listing[]>([]);
    const [brandsData, setBrandsData] = useState<Brand[]>([]);
    const [carModelsData, setCarModelsData] = useState<CarModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if user is logged in
    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
    }, []);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const [selectedModelId, setSelectedModelId] = useState<string>('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Load brands and car models on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [brandsRes, carModelsRes] = await Promise.all([
                    fetch(brands.index().url, { credentials: 'include' }),
                    fetch(carModels.index().url, { credentials: 'include' }),
                ]);

                if (brandsRes.ok) {
                    const brandsJson = await brandsRes.json();
                    setBrandsData(Array.isArray(brandsJson) ? brandsJson : []);
                }

                if (carModelsRes.ok) {
                    const carModelsJson = await carModelsRes.json();
                    setCarModelsData(Array.isArray(carModelsJson) ? carModelsJson : []);
                }
            } catch (e) {
                console.error('Failed to load brands/models:', e);
            }
        };

        void loadData();
    }, []);

    // Load listings with filters
    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams();
                if (searchQuery) params.append('search', searchQuery);
                if (selectedBrandId) params.append('brand_id', selectedBrandId);
                if (selectedModelId) params.append('car_model_id', selectedModelId);
                if (minPrice) params.append('min_price', minPrice);
                if (maxPrice) params.append('max_price', maxPrice);

                const url =
                    listings.apiIndex().url + (params.toString() ? `?${params.toString()}` : '');
                const res = await fetch(url, {
                    credentials: 'include',
                });

                if (!res.ok) {
                    throw new Error('Failed to load listings');
                }

                const data = await res.json();
                setListingsData(Array.isArray(data) ? data : []);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        void fetchListings();
    }, [searchQuery, selectedBrandId, selectedModelId, minPrice, maxPrice]);

    // Filter car models by selected brand
    const filteredCarModels = selectedBrandId
        ? carModelsData.filter((model) => model.brand_id === Number(selectedBrandId))
        : carModelsData;

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedBrandId('');
        setSelectedModelId('');
        setMinPrice('');
        setMaxPrice('');
    };

    return (
        <>
            <Head title="AutoPliusMinus - Car Listings Platform" />
            <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-secondary/20">
                {/* Header with responsive hamburger menu */}
                <Header />

                {/* Hero Section */}
                <section className="border-b border-border/40 bg-gradient-to-br from-primary/5 via-background to-secondary/10">
                    <div className="mx-auto max-w-7xl px-4 py-12 text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Browse Quality Cars
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Discover approved car listings from trusted sellers. Filter by brand,
                            model, and price.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <Link href="/listings">
                                <Button size="lg" variant="default">
                                    View All Listings
                                </Button>
                            </Link>
                            {!isLoggedIn && (
                                <Link href={register.url()}>
                                    <Button size="lg" variant="outline">
                                        Start Selling
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Main content */}
                <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8">
                    {/* Filters Card */}
                    <Card className="border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Search & Filter</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search</Label>
                                    <Input
                                        id="search"
                                        placeholder="Search by title, brand, model..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brand">Brand</Label>
                                    <Select
                                        value={selectedBrandId}
                                        onValueChange={(value) => {
                                            setSelectedBrandId(value);
                                            setSelectedModelId(''); // Reset model when brand changes
                                        }}
                                    >
                                        <SelectTrigger id="brand">
                                            <SelectValue placeholder="All brands" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All brands</SelectItem>
                                            {brandsData.map((brand) => (
                                                <SelectItem key={brand.id} value={String(brand.id)}>
                                                    {brand.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="model">Model</Label>
                                    <Select
                                        value={selectedModelId}
                                        onValueChange={setSelectedModelId}
                                    >
                                        <SelectTrigger id="model" disabled={!selectedBrandId}>
                                            <SelectValue placeholder="Select model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All models</SelectItem>
                                            {filteredCarModels.map((model) => (
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

                                <div className="space-y-2">
                                    <Label htmlFor="minPrice">Min. price (€)</Label>
                                    <Input
                                        id="minPrice"
                                        type="number"
                                        placeholder="0"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maxPrice">Max. price (€)</Label>
                                    <Input
                                        id="maxPrice"
                                        type="number"
                                        placeholder="100000"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={clearFilters}
                                    >
                                        Clear filters
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Listings Section */}
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">
                                    Available Listings
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {loading
                                        ? 'Loading...'
                                        : `${listingsData.length} ${listingsData.length === 1 ? 'listing' : 'listings'} found`}
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <Card key={i} className="animate-pulse">
                                        <div className="aspect-video bg-muted" />
                                        <CardHeader>
                                            <div className="h-6 w-3/4 rounded bg-muted" />
                                            <div className="h-4 w-1/2 rounded bg-muted" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-4 w-full rounded bg-muted" />
                                            <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : listingsData.length === 0 ? (
                            <Card>
                                <CardContent className="py-16 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                        <svg
                                            className="h-8 w-8 text-muted-foreground"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold">
                                        No listings found
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Try adjusting your filters or check back later for new
                                        listings.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {listingsData.map((listing) => (
                                    <Link
                                        key={listing.id}
                                        href={`/listings/${listing.id}`}
                                        className="group"
                                    >
                                        <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                                            <div className="relative aspect-video overflow-hidden bg-muted">
                                                <img
                                                    src="https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800"
                                                    alt={listing.title}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                                {listing.status === 'sold' && (
                                                    <div className="absolute right-2 top-2 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                                                        Sold
                                                    </div>
                                                )}
                                                {listing.status === 'reserved' && (
                                                    <div className="absolute right-2 top-2 rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white">
                                                        Reserved
                                                    </div>
                                                )}
                                            </div>
                                            <CardHeader>
                                                <CardTitle className="line-clamp-1 text-lg group-hover:text-primary">
                                                    {listing.title}
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground">
                                                    {listing.car_model?.brand?.name ?? 'Unknown'}{' '}
                                                    {listing.car_model?.name ?? 'Unknown'} ·{' '}
                                                    {listing.car_model?.year ?? 'N/A'}
                                                </p>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                                    {listing.description}
                                                </p>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <p className="text-2xl font-bold text-primary">
                                                        €{listing.price.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {listing.mileage.toLocaleString()} km
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-border/70 bg-muted/30">
                    <div className="mx-auto max-w-7xl px-4 py-8">
                        <div className="grid gap-8 md:grid-cols-3">
                            <div>
                                <h3 className="mb-3 text-sm font-semibold">AutoPliusMinus</h3>
                                <p className="text-xs text-muted-foreground">
                                    Your trusted platform for buying and selling quality cars.
                                    Browse approved listings from verified sellers.
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-3 text-sm font-semibold">Quick Links</h3>
                                <ul className="space-y-2 text-xs text-muted-foreground">
                                    <li>
                                        <Link href="/listings" className="hover:text-foreground">
                                            All Listings
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={login.url()} className="hover:text-foreground">
                                            Login
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={register.url()} className="hover:text-foreground">
                                            Register
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-3 text-sm font-semibold">Statistics</h3>
                                <ul className="space-y-2 text-xs text-muted-foreground">
                                    <li>Active Listings: {listingsData.length}</li>
                                    <li>Available Brands: {brandsData.length}</li>
                                    <li>Car Models: {carModelsData.length}</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
                            © 2025 AutoPliusMinus. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

