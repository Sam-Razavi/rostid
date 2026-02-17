import { Request, Response } from 'express';
import { createReviewSchema } from './reviews.schema';
import { listReviews, createReview } from './reviews.service';

export async function getReviews(req: Request, res: Response): Promise<void> {
  const result = await listReviews(req.params.slug);
  res.json({ data: result, message: 'OK' });
}

export async function postReview(req: Request, res: Response): Promise<void> {
  const { body } = createReviewSchema.parse({ body: req.body });
  const review = await createReview(req.params.slug, req.user.id, body);
  res.status(201).json({ data: review, message: 'Review submitted' });
}
