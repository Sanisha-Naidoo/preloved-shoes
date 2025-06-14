
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShoeFormData } from "../types";
import { validateShoeSize, getSizeErrorMessage } from "../utils/sizeValidation";

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
    },
    mode: "onChange"
  });

  const selectedBrand = form.watch("brand");
  const selectedSizeUnit = form.watch("sizeUnit");

  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const validateSize = (size: string) => {
    if (!size) return "Size is required";
    
    if (!validateShoeSize(size, selectedSizeUnit)) {
      return getSizeErrorMessage(selectedSizeUnit);
    }
    
    return true;
  };

  const onSubmit = (data: ShoeFormData) => {
    // Validate size before submission
    const sizeValidation = validateSize(data.size);
    if (sizeValidation !== true) {
      form.setError("size", { message: sizeValidation });
      toast.error(sizeValidation);
      return;
    }

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
    selectedSizeUnit,
    onSubmit,
    triggerHapticFeedback,
    validateSize
  };
};
