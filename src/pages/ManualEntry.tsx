import React from "react";
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
  const onSubmit = (data: ShoeFormData) => {
    // Store the data in session storage to be used later
    sessionStorage.setItem("shoeDetails", JSON.stringify(data));
    navigate("/photo-capture");
  };
  return <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Enter Shoe Details</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="brand" render={({
            field
          }) => <FormItem>
                  <FormLabel>Brand *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nike, Adidas, etc." required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="model" render={({
            field
          }) => <FormItem>
                  <FormLabel>Model (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Air Max, Stan Smith, etc." className="" />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <div className="space-y-2">
              <Label>Size *</Label>
              <div className="flex gap-2">
                <div className="w-1/3">
                  <FormField control={form.control} name="sizeUnit" render={({
                  field
                }) => <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
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
                      </FormItem>} />
                </div>
                
                <div className="w-2/3">
                  <FormField control={form.control} name="size" render={({
                  field
                }) => <FormItem>
                        <FormControl>
                          <Input placeholder="Enter size number" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>
              </div>
            </div>

            <FormField control={form.control} name="condition" render={({
            field
          }) => <FormItem>
                  <FormLabel>Condition *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                </FormItem>} />

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </Form>
      </div>
    </div>;
};
export default ManualEntry;