# Auto+- REST API

A simple API for buying and selling cars. Users can create listings, view car models by brand, and comment on listings.

## What This Does

- View car brands and models
- Create, edit, and delete car listings
- Comment on listings
- Admin can approve or reject listings

## Setup

### 1. Install

```bash
git clone <your-repo>
cd car-api
composer install
```

### 2. Setup Database

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` file and set your database:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=car_api
DB_USERNAME=root
DB_PASSWORD=
```

Create the database in MySQL:
```bash
CREATE DATABASE car_api;
```

### 3. Generate Key and Run Migrations

```bash
php artisan key:generate
php artisan migrate:fresh --seed
```

This creates tables and adds test data.

### 4. Start Server

```bash
php artisan serve
```

Go to: `http://localhost:8000`

## API Endpoints

### Brands
- `GET /api/brands` - Get all brands
- `GET /api/brands/{id}` - Get one brand
- `POST /api/brands` - Create brand (admin only)
- `PUT /api/brands/{id}` - Edit brand (admin only)
- `DELETE /api/brands/{id}` - Delete brand (admin only)

### Models
- `GET /api/car-models` - Get all models
- `GET /api/brands/{brandId}/car-models` - Get models by brand
- `GET /api/car-models/{id}` - Get one model
- `POST /api/car-models` - Create model (admin only)
- `PUT /api/car-models/{id}` - Edit model (admin only)
- `DELETE /api/car-models/{id}` - Delete model (admin only)

### Listings
- `GET /api/listings` - Get all listings (approved only)
- `GET /api/car-models/{modelId}/listings` - Get listings by model
- `GET /api/listings/{id}` - Get one listing with comments
- `POST /api/listings` - Create listing
- `PUT /api/listings/{id}` - Edit your listing
- `DELETE /api/listings/{id}` - Delete listing
- `PATCH /api/listings/{id}/approve` - Approve listing (admin only)
- `PATCH /api/listings/{id}/reject` - Reject listing (admin only)

### Comments
- `GET /api/comments` - Get all comments
- `GET /api/listings/{listingId}/comments` - Get comments for listing
- `GET /api/comments/{id}` - Get one comment
- `POST /api/comments` - Create comment
- `PUT /api/comments/{id}` - Edit comment
- `DELETE /api/comments/{id}` - Delete comment

## Test Data

When you run `php artisan migrate:fresh --seed`, you get:

- 4 users (guest, 2 regular users, 1 admin)
- 8 car brands (BMW, Audi, Volkswagen, etc.)
- 25 car models
- 20 car listings
- 60+ comments

## Test with Postman

1. Open Postman
2. Create new requests:
   ```
   GET http://localhost:8000/api/brands
   GET http://localhost:8000/api/listings
   POST http://localhost:8000/api/listings
   ```
3. Send requests and see results

## HTTP Response Codes

- `200` - Success (data returned)
- `201` - Created (new item made)
- `204` - Deleted (no data returned)
- `400` - Bad request (wrong data sent)
- `404` - Not found (item doesn't exist)
- `422` - Validation error (data format wrong)

## Check All Routes

```bash
php artisan route:list

# Or just API routes
php artisan route:list --path=api
```

## Users (Test Logins)

After seeding:

| Email | Role | Password |
|-------|------|----------|
| guest@example.com | guest | password |
| user@example.com | user | password |
| user2@example.com | user | password |
| admin@example.com | admin | password |

## File Structure

```
car-api/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── BrandController.php
│   │   ├── CarModelController.php
│   │   ├── ListingController.php
│   │   └── CommentController.php
│   └── Models/
│       ├── Brand.php
│       ├── CarModel.php
│       ├── Listing.php
│       └── Comment.php
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── routes/
│   └── web.php
└── README.md
```

## Notes

- All dates use timestamps (created_at, updated_at)
- Listings start as "pending" and need admin approval
- Test data is fake - you can delete and create new data

## Troubleshooting

**Routes not working?**
```bash
php artisan route:list --path=api
```

**Database error?**
Check `.env` file - DB_PASSWORD might be wrong

**Still getting errors?**
Clear cache:
```bash
php artisan config:cache
php artisan cache:clear
```
