
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft } from "lucide-react";

type ShoeFormData = {
  brand: string;
  model: string;
  size: string;
  sizeUnit: string;
  condition: string;
};

const ManualEntry = () => {
  const navigate = useNavigate();
  const form = useForm<ShoeFormData>({
    defaultValues: {
      brand: "",
      model: "",
      size: "",
      sizeUnit: "EU",
      condition: "used"
    }
  });

  // Add haptic feedback for mobile devices
  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // Vibrate for 50ms
    }
  };

  const onSubmit = (data: ShoeFormData) => {
    // Store the data in session storage to be used later
    sessionStorage.setItem("shoeDetails", JSON.stringify(data));
    triggerHapticFeedback();
    
    // Show a success toast
    toast.success("Details saved successfully!");
    
    // Navigate to the next page
    navigate("/photo-capture");
  };

  // Implement swipe navigation (swipe right to go back)
  useEffect(() => {
    let touchStartX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - touchStartX;
      
      // If swiped right more than 100px, navigate back
      if (diffX > 100) {
        navigate("/");
        triggerHapticFeedback();
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      <Button 
        variant="ghost" 
        className="mb-6 h-12 w-12" 
        onClick={() => {
          triggerHapticFeedback();
          navigate("/");
        }}
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Back</span>
      </Button>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Enter Shoe Details</h1>
        <p className="text-sm text-gray-600 mb-4">Swipe right to go back</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control} 
              name="brand" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="On Cloud, Nike, Adidas, etc." 
                      required 
                      className="h-12 text-base" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <FormField 
              control={form.control} 
              name="model" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Air Max, Cloudrunner, Sky lifestyle etc." 
                      className="h-12 text-base" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <div className="space-y-2">
              <Label>Size *</Label>
              <div className="flex gap-2">
                <div className="w-1/3">
                  <FormField 
                    control={form.control} 
                    name="sizeUnit" 
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EU">EU</SelectItem>
                            <SelectItem value="UK">UK</SelectItem>
                            <SelectItem value="US">US</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                </div>
                
                <div className="w-2/3">
                  <FormField 
                    control={form.control} 
                    name="size" 
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Enter size number" 
                            inputMode="decimal"
                            pattern="[0-9]*\.?[0-9]*"
                            className="h-12 text-base" 
                            required 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                </div>
              </div>
            </div>

            <FormField 
              control={form.control} 
              name="condition" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like_new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <Button type="submit" className="w-full h-14 text-base font-medium">
              Continue
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ManualEntry;
