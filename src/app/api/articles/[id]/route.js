// app/api/articles/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { styleHtmlContent, extractTitle } from '@/lib/htmlStyler';
import { generateSlug, ensureUniqueSlug } from '@/lib/slugify';

// GET - Fetch single article by slug or id
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Try to fetch by slug first, then by id
    let result;
    if (isNaN(id)) {
      result = await query(
        'SELECT * FROM articles WHERE slug = $1',
        [id]
      );
    } else {
      result = await query(
        'SELECT * FROM articles WHERE id = $1',
        [id]
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      article: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT - Update article
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { rawHtml, customSlug } = await request.json();

    if (!rawHtml) {
      return NextResponse.json(
        { error: 'Raw HTML is required' },
        { status: 400 }
      );
    }

    // Extract new title
    const title = extractTitle(rawHtml);

    // Handle slug update
    let slug = customSlug;
    if (customSlug) {
      slug = generateSlug(customSlug);
      
      // Check if new slug conflicts with existing
      const existingResult = await query(
        'SELECT slug FROM articles WHERE slug = $1 AND id != $2',
        [slug, id]
      );

      if (existingResult.rows.length > 0) {
        const similarSlugs = await query(
          "SELECT slug FROM articles WHERE slug LIKE $1 AND id != $2",
          [`${slug}%`, id]
        );
        const existingSlugs = similarSlugs.rows.map(row => row.slug);
        slug = ensureUniqueSlug(slug, existingSlugs);
      }
    }

    // Style the HTML
    const styledHtml = styleHtmlContent(rawHtml);

    // Update query
    const updateFields = ['title = $1', 'raw_html = $2', 'styled_html = $3', 'updated_at = NOW()'];
    const updateValues = [title, rawHtml, styledHtml];
    let paramIndex = 4;

    if (slug) {
      updateFields.push(`slug = $${paramIndex}`);
      updateValues.push(slug);
      paramIndex++;
    }

    updateValues.push(id);

    const result = await query(
      `UPDATE articles 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE - Delete article
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'DELETE FROM articles WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}