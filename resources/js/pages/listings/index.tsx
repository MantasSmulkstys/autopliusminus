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
import listings from '@/routes/listings';
import brands from '@/routes/brands';
import carModels from '@/routes/car-models';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Listing = {
    id: number;
    title: string;
    description: string;
    price: number;
    mileage: number;
    color: string;
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
};

type CarModel = {
    id: number;
    name: string;
    year: number;
    brand_id: number;
    brand?: Brand;
};

export default function ListingsIndex() {
    const [listingsData, setListingsData] = useState<Listing[]>([]);
    const [brandsData, setBrandsData] = useState<Brand[]>([]);
    const [carModelsData, setCarModelsData] = useState<CarModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const [selectedModelId, setSelectedModelId] = useState<string>('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Load brands and car models
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
            <Head title="Car Listings" />
            <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-secondary/40">
                {/* Header with responsive hamburger menu */}
                <Header />

                {/* Main content */}
                <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Car Listings
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Browse approved car listings. Filter by brand, model, or price.
                        </p>
                    </div>

                    {/* Filters */}
                    <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search</Label>
                                    <Input
                                        id="search"
                                        placeholder="Brand, model, title..."
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
                                            <SelectValue placeholder="Select brand" />
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

                    {/* Listings */}
                    {error && (
                        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : listingsData.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-sm text-muted-foreground">
                                    No listings found. Try adjusting your filters.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {listingsData.map((listing) => (
                                <Link key={listing.id} href={`/listings/${listing.id}`}>
                                    <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                                        <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                                            <img
                                                src="https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800"
                                                alt={listing.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="line-clamp-1 text-lg">
                                                {listing.title}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground">
                                                {listing.car_model?.brand?.name ?? 'Unknown brand'}{' '}
                                                {listing.car_model?.name ?? 'Unknown model'} ·{' '}
                                                {listing.car_model?.year ?? 'N/A'} ·{' '}
                                                {listing.mileage.toLocaleString('en-US')} km ·{' '}
                                                {listing.color}
                                            </p>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                                {listing.description}
                                            </p>
                                            <p className="mt-4 text-xl font-semibold">
                                                {listing.price.toLocaleString('en-US')} €
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="border-t border-border/70 bg-background/90">
                    <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
                        <span>
                            AutoPliusMinus – public car listings website. You can browse brands, models, and listings without registration.
                        </span>
                        <span>
                            Listings found: <strong>{listingsData.length}</strong>
                        </span>
                    </div>
                </footer>
            </div>
        </>
    );
}

