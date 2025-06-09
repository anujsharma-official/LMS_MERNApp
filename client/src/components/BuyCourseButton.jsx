import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BuyCourseButton = ({ courseId }) => {
  const [
    createCheckoutSession,
    { data, isLoading, isSuccess, isError, error },
  ] = useCreateCheckoutSessionMutation();

  const purchaseCourseHandler = async () => {
    await createCheckoutSession({ courseId }); // API expects an object with courseId
  };

  useEffect(() => {
    if (isSuccess && data?.orderId) {
      if (!window.Razorpay) {
        toast.error("Razorpay SDK not loaded");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: data.courseTitle,
        description: "Course Purchase",
        image: data.courseThumbnail,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            await axios.post(
              `${backendUrl}/api/v1/purchase/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId,
              },
              { withCredentials: true }
            );
            toast.success("Payment successful! Redirecting...");
            window.location.href = `/course-progress/${courseId}`;
          } catch (err) {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: "Your User Name", // Replace with actual user data if possible
          email: "user@example.com", // Replace with actual user email
        },
        theme: {
          color: "#6366f1",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    }

    if (isError) {
      toast.error(error?.data?.message || "Failed to create checkout session");
    }
  }, [data, isSuccess, isError, error, courseId]);

  return (
    <Button
      disabled={isLoading}
      onClick={purchaseCourseHandler}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        "Purchase Course"
      )}
    </Button>
  );
};

export default BuyCourseButton;
