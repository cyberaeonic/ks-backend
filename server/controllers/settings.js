// Settings Controller - Store configuration persistence
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getSettings(req, res) {
  try {
    let record = await prisma.store_settings.findFirst();
    if (!record) {
      return res.json({
        storeName: 'Sree Meenakshi Handicrafts',
        whatsappNumber: '919944910653',
        storeEmail: '',
        razorpayKey: '',
        razorpayEnabled: false,
        shippingFee: 150,
        freeShippingThreshold: 2999,
        topBannerText1: 'Complimentary FREE Delivery on orders above Rs.2,999',
        topBannerHighlight: 'Use Coupon HERITAGE10 for 10% OFF',
        couponCode: 'HERITAGE10',
        couponDiscountPct: 10,
        welcomeCouponCode: 'WELCOME5',
        welcomeDiscountPct: 5,
      });
    }
    return res.json(record);
  } catch (err) {
    console.error('Settings GET error:', err);
    return res.status(500).json({ error: 'Failed to load settings' });
  }
}

async function saveSettings(req, res) {
  try {
    const {
      storeName, whatsappNumber, storeEmail,
      razorpayKey, razorpayEnabled,
      shippingFee, freeShippingThreshold,
      topBannerText1, topBannerHighlight,
      couponCode, couponDiscountPct,
      welcomeCouponCode, welcomeDiscountPct,
    } = req.body;

    const data = {
      storeName: storeName || 'Sree Meenakshi Handicrafts',
      whatsappNumber: whatsappNumber || '',
      storeEmail: storeEmail || '',
      razorpayKey: razorpayKey || '',
      razorpayEnabled: razorpayEnabled === true || razorpayEnabled === 'true',
      shippingFee: parseFloat(shippingFee) || 150,
      freeShippingThreshold: parseFloat(freeShippingThreshold) || 2999,
      topBannerText1: topBannerText1 || '',
      topBannerHighlight: topBannerHighlight || '',
      couponCode: couponCode || 'HERITAGE10',
      couponDiscountPct: parseFloat(couponDiscountPct) || 10,
      welcomeCouponCode: welcomeCouponCode || 'WELCOME5',
      welcomeDiscountPct: parseFloat(welcomeDiscountPct) || 5,
    };

    const existing = await prisma.store_settings.findFirst();
    let saved;
    if (existing) {
      saved = await prisma.store_settings.update({ where: { id: existing.id }, data });
    } else {
      saved = await prisma.store_settings.create({ data });
    }
    return res.json({ success: true, settings: saved });
  } catch (err) {
    console.error('Settings POST error:', err);
    return res.status(500).json({ error: 'Failed to save settings' });
  }
}

module.exports = { getSettings, saveSettings };
