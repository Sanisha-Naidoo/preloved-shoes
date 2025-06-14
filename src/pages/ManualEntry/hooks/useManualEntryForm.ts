
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShoeFormData } from "../types";

export const useManualEntryForm = () => {
  const navigate = useNavigate();
  
  const form = useForm<ShoeFormData>({
    defaultValues: {
      brand: "",
      customBrand: "",
      model: "",
      size: "",
      sizeUnit: "EU",
      condition: "used"
    }
  });

  const selectedBrand = form.watch("brand");

  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const onSubmit = (data: ShoeFormData) => {
    const finalData = {
      ...data,
      brand: data.brand === "Other" ? data.customBrand : data.brand
    };

    const { customBrand, ...dataToStore } = finalData;
    
    sessionStorage.setItem("shoeDetails", JSON.stringify(dataToStore));
    triggerHapticFeedback();

    toast.success("Details saved successfully!");
    navigate("/photo-capture");
  };

  return {
    form,
    selectedBrand,
    onSubmit,
    triggerHapticFeedback
  };
};
