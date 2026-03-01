import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

const isPlaceholder = (key: string | undefined) =>
    !key || key.includes('your_key') || key.includes('placeholder') || key === 'rzp_test_mock';

const razorpayInstance = (razorpayKeyId && razorpayKeySecret && !isPlaceholder(razorpayKeyId) && !isPlaceholder(razorpayKeySecret))
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
    })
    : null;

export class PaymentService {
    /**
     * Create a Razorpay order for online payment
     */
    static async createRazorpayOrder(amount: number, invoiceId: string) {
        if (!razorpayInstance) {
            console.log(`[PAYMENT MOCK] Would create Razorpay order for ₹${amount} (Invoice: ${invoiceId})`);
            return {
                id: `order_mock_${Date.now()}`,
                amount: amount * 100, // Convert to paise
                currency: 'INR',
                status: 'created',
                isMock: true
            };
        }

        try {
            const options = {
                amount: amount * 100, // Razorpay expects amount in paise
                currency: 'INR',
                receipt: invoiceId,
                notes: {
                    invoiceId: invoiceId,
                    purpose: 'Rent Payment'
                }
            };

            const order = await razorpayInstance.orders.create(options);
            console.log(`[Razorpay] Order created: ${order.id} for ₹${amount}`);
            return order;
        } catch (error) {
            console.error('[Razorpay] Order creation failed:', error);
            throw new Error('Failed to create payment order');
        }
    }

    /**
     * Verify Razorpay payment signature
     */
    static verifyPaymentSignature(
        orderId: string,
        paymentId: string,
        signature: string
    ): boolean {
        if (!razorpayInstance || !razorpayKeySecret) {
            console.log(`[PAYMENT MOCK] Would verify signature for payment ${paymentId}`);
            return true; // Mock mode always succeeds
        }

        try {
            const text = `${orderId}|${paymentId}`;
            const generatedSignature = crypto
                .createHmac('sha256', razorpayKeySecret)
                .update(text)
                .digest('hex');

            const isValid = generatedSignature === signature;
            console.log(`[Razorpay] Signature verification: ${isValid ? 'SUCCESS' : 'FAILED'}`);
            return isValid;
        } catch (error) {
            console.error('[Razorpay] Signature verification error:', error);
            return false;
        }
    }

    /**
     * Fetch payment details from Razorpay
     */
    static async getPaymentDetails(paymentId: string) {
        if (!razorpayInstance) {
            console.log(`[PAYMENT MOCK] Would fetch payment details for ${paymentId}`);
            return {
                id: paymentId,
                status: 'captured',
                method: 'upi',
                amount: 5000,
                isMock: true
            };
        }

        try {
            const payment = await razorpayInstance.payments.fetch(paymentId);
            console.log(`[Razorpay] Payment details fetched: ${payment.id} - ${payment.status}`);
            return payment;
        } catch (error) {
            console.error('[Razorpay] Failed to fetch payment details:', error);
            throw new Error('Failed to fetch payment details');
        }
    }

    /**
     * Check if Razorpay is configured
     */
    static isConfigured(): boolean {
        return !!razorpayInstance;
    }
}
