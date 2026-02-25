<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            ['name' => 'Rose Bouquet',            'price' => 250000, 'image' => '/rose_bouquet.jpeg'],
            ['name' => 'Lily Flower',             'price' => 200000, 'image' => '/lily.jpeg'],
            ['name' => 'Tulip Blossom',           'price' => 300000, 'image' => '/tulip.jpeg'],
            ['name' => 'Sunflower',               'price' => 180000, 'image' => '/sunflower.jpeg'],
            ['name' => 'Thumbelina Bouquet',      'price' => 150000, 'image' => '/thumbelina.jpeg'],
            ['name' => 'Hydrangea Bouquet',       'price' => 210000, 'image' => '/hydrangea.jpg'],
            ['name' => 'Daisy Bouquet',           'price' => 200000, 'image' => '/daisy.jpeg'],
            ['name' => 'Ranunculus Bouquet',      'price' => 155000, 'image' => '/ranunculus.jpeg'],
            ['name' => 'Prettiest Peony Bouquet', 'price' => 155000, 'image' => '/peonies.jpg'],
            ['name' => 'Korean Bouquet',          'price' => 345000, 'image' => '/korean.jpg'],
            ['name' => 'Classic Gentleman Bloom', 'price' => 275000, 'image' => '/classic.jpg'],
            ['name' => 'Romantical bouquet',      'price' => 335000, 'image' => '/romantical.jpg'],
        ];

        foreach ($products as $product) {
            \App\Models\Product::updateOrCreate(['name' => $product['name']], $product);
        }
    }
}
