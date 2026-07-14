import { Router } from 'express';
import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  listShippingRates,
} from './shipping.service';

const router = Router();

router.get(
  '/rates',
  asyncHandler(async (req: Request, res: Response) => {
    const totalOre = Number(req.query.totalOre ?? 0);
    const rates = await listShippingRates(totalOre);
    res.json({ data: { rates }, message: 'Shipping rates retrieved' });
  })
);

router.use(authenticate);

router.get(
  '/addresses',
  asyncHandler(async (req: Request, res: Response) => {
    const addresses = await listAddresses(req.user!.userId);
    res.json({ data: { addresses }, message: 'Addresses retrieved' });
  })
);

router.post(
  '/addresses',
  asyncHandler(async (req: Request, res: Response) => {
    const address = await createAddress(
      req.user!.userId,
      req.body as Parameters<typeof createAddress>[1]
    );
    res.status(201).json({ data: { address }, message: 'Address created' });
  })
);

router.patch(
  '/addresses/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const address = await updateAddress(
      req.user!.userId,
      req.params.id,
      req.body as Parameters<typeof updateAddress>[2]
    );
    res.json({ data: { address }, message: 'Address updated' });
  })
);

router.delete(
  '/addresses/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await deleteAddress(req.user!.userId, req.params.id);
    res.json({ data: null, message: 'Address deleted' });
  })
);

export default router;
