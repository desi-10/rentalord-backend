declare namespace Express {
  interface Request {
    userId?: string;
    role?: string;
    propertyId?: string;
    businessId?: string;
  }
}
