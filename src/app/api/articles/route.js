// app/api/articles/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { styleHtmlContent, extractTitle } from '@/lib/htmlStyler';
import { generateSlug, ensureUniqueSlug } from '@/lib/slugify';

// GET - Fetch all articles
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT id, title, slug, 
        LEFT(raw_html, 200) as preview, 
        created_at, updated_at
       FROM articles 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM articles');
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      articles: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST - Create new article
export async function POST(request) {
  try {
    const { rawHtml, customSlug } = await request.json();

    if (!rawHtml) {
      return NextResponse.json(
        { error: 'Raw HTML is required' },
        { status: 400 }
      );
    }

    // Extract title from HTML
    const title = extractTitle(rawHtml);

    // Generate slug
    let slug = customSlug || generateSlug(title);

    // Check if slug exists
    const existingResult = await query(
      'SELECT slug FROM articles WHERE slug = $1',
      [slug]
    );

    if (existingResult.rows.length > 0) {
      // Get all similar slugs
      const similarSlugs = await query(
        "SELECT slug FROM articles WHERE slug LIKE $1",
        [`${slug}%`]
      );
      const existingSlugs = similarSlugs.rows.map(row => row.slug);
      slug = ensureUniqueSlug(slug, existingSlugs);
    }

    // Style the HTML
    const styledHtml = styleHtmlContent(rawHtml);

    // Insert into database
    const result = await query(
      `INSERT INTO articles (title, slug, raw_html, styled_html, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [title, slug, rawHtml, styledHtml]
    );

    return NextResponse.json({
      success: true,
      article: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article', details: error.message },
      { status: 500 }
    );
  }
}