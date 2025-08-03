
import { type Product } from '../schema';

export async function getProductById(id: number): Promise<Product | null> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch a single product by its ID.
    // Steps: 1) Query product by ID, 2) Return product or null if not found
    return Promise.resolve({
        id,
        name: 'Nucless Galon 19L',
        description: 'Air mineral berkualitas tinggi dalam kemasan galon 19 liter',
        price: 15000,
        image_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
    });
}
