
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import AdminPanel from "@/components/AdminPanel";
import { createCertificateRequest, findCertificateRequestByName, CertificateRequest } from "@/data/certificateRequests";
import Logo from "@/components/Logo";
import { Loader2 } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const Index = () => {
  const [userName, setUserName] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formOpened, setFormOpened] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [certificateStatus, setCertificateStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const handleOpenForm = () => {
    if (!userName.trim()) {
      toast({
        title: "নাম প্রয়োজন",
        description: "দয়া করে আপনার পুরো নাম লিখুন",
        variant: "destructive",
      });
      return;
    }

    // Open Google Form in a new tab
    window.open(
      "https://docs.google.com/forms/d/e/1FAIpQLSd2mTY3mfh8-C2BBtcXAVbcu7DkUstyVoH1SeeVxsPZjHiI0Q/viewform",
      "_blank"
    );
    setFormOpened(true);
  };

  const handleRequestCertificate = async () => {
    // Add the request to the database
    const newRequest = await createCertificateRequest(userName);
    
    if (newRequest) {
      setRequestSubmitted(true);
      toast({
        title: "অনুরোধ সফল",
        description: "আপনার সার্টিফিকেট অনুরোধ পাঠানো হয়েছে। অনুমোদন পেলে আপনি ডাউনলোড করতে পারবেন।",
        variant: "default",
      });
    } else {
      toast({
        title: "অনুরোধ ব্যর্থ",
        description: "সার্টিফিকেট অনুরোধ করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।",
        variant: "destructive",
      });
    }
  };

  const checkStatus = async () => {
    if (!userName.trim()) {
      toast({
        title: "নাম প্রয়োজন",
        description: "দয়া করে আপনার পুরো নাম লিখুন",
        variant: "destructive",
      });
      return;
    }
    
    setCheckingStatus(true);
    const request = await findCertificateRequestByName(userName);
    setCheckingStatus(false);
    
    if (!request) {
      toast({
        title: "কোনো অনুরোধ পাওয়া যায়নি",
        description: "এই নামে কোনো সার্টিফিকেট অনুরোধ পাওয়া যায়নি।",
        variant: "destructive",
      });
      setCertificateStatus(null);
      return;
    }

    setCertificateStatus(request.status);

    if (request.status === "approved") {
      toast({
        title: "অনুমোদিত!",
        description: "আপনার সার্টিফিকেট অনুমোদিত হয়েছে। আপনি এখন এটি ডাউনলোড করতে পারেন।",
        variant: "default",
      });
    } else if (request.status === "pending") {
      toast({
        title: "অপেক্ষমান",
        description: "আপনার সার্টিফিকেট এখনও অনুমোদনের অপেক্ষায় আছে। দয়া করে পরে আবার চেক করুন।",
        variant: "default",
      });
    } else {
      toast({
        title: "প্রত্যাখ্যাত",
        description: "আপনার সার্টিফিকেট অনুরোধ প্রত্যাখ্যান করা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const downloadCertificate = async () => {
    if (!userName.trim()) {
      toast({
        title: "নাম প্রয়োজন",
        description: "দয়া করে আপনার পুরো নাম লিখুন",
        variant: "destructive",
      });
      return;
    }
    
    // Check status first if we don't already know it
    if (certificateStatus === null) {
      setCheckingStatus(true);
      const request = await findCertificateRequestByName(userName);
      setCheckingStatus(false);
      
      if (!request) {
        toast({
          title: "কোনো অনুরোধ পাওয়া যায়নি",
          description: "এই নামে কোনো সার্টিফিকেট অনুরোধ পাওয়া যায়নি।",
          variant: "destructive",
        });
        return;
      }
      
      setCertificateStatus(request.status);
      
      if (request.status !== "approved") {
        if (request.status === "pending") {
          toast({
            title: "অপেক্ষমান",
            description: "আপনার সার্টিফিকেট এখনও অনুমোদনের অপেক্ষায় আছে। দয়া করে পরে আবার চেক করুন।",
            variant: "default",
          });
        } else {
          toast({
            title: "প্রত্যাখ্যাত",
            description: "আপনার সার্টিফিকেট অনুরোধ প্রত্যাখ্যান করা হয়েছে।",
            variant: "destructive",
          });
        }
        return;
      }
    }
    
    if (certificateStatus !== "approved") {
      toast({
        title: "অপেক্ষমান",
        description: "আপনার সার্টিফিকেট এখনও অনুমোদনের অপেক্ষায় আছে। দয়া করে পরে আবার চেক করুন।",
        variant: "default",
      });
      return;
    }

    setDownloading(true);
    toast({
      title: "ডাউনলোড শুরু হচ্ছে",
      description: "আপনার সার্টিফিকেট ডাউনলোড হচ্ছে...",
      variant: "default",
    });

    try {
      // Fetch the certificate template
      const pdfBytes = await fetch('/Certificate.pdf').then(res => res.arrayBuffer());
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[0];
      
      // Calculate text positioning for center alignment
      const fontSize = 28;
      const textWidth = userName.length * (fontSize * 0.6);
      const xPos = (page.getWidth() / 2) - (textWidth / 2);
      const yPos = 470; // Position where name should be placed
      
      // Draw the user name on the certificate
      page.drawText(userName.toUpperCase(), {
        x: xPos,
        y: yPos,
        size: fontSize,
        color: rgb(0, 0, 0),
        font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      });
      
      // Save the PDF and trigger download
      const newPdfBytes = await pdfDoc.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${userName}_Blood_Donation_Certificate.pdf`;
      link.click();
      
      toast({
        title: "ডাউনলোড সম্পন্ন",
        description: "আপনার সার্টিফিকেট ডাউনলোড হয়েছে।",
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "ডাউনলোড ব্যর্থ",
        description: "সার্টিফিকেট ডাউনলোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo />
          <h1 className="text-3xl md:text-4xl font-bold text-red-600 text-center mt-4">
            বগুড়া অনলাইন রক্তদান সংগঠন সার্টিফিকেট
          </h1>
        </div>
        
        <Tabs defaultValue="user" className="max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">ব্যবহারকারী</TabsTrigger>
            <TabsTrigger value="admin">এডমিন</TabsTrigger>
          </TabsList>
          
          <TabsContent value="user">
            <Card>
              <CardHeader>
                <CardTitle>সার্টিফিকেট অনুরোধ</CardTitle>
                <CardDescription>
                  রক্তদান সার্টিফিকেট পেতে নিচের ফর্মটি পূরণ করুন
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      আপনার পুরো নাম
                    </label>
                    <Input
                      id="name"
                      placeholder="আপনার পুরো নাম লিখুন"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {!requestSubmitted ? (
                    <>
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={handleOpenForm}
                        disabled={formOpened}
                      >
                        {formOpened ? "ফর্ম খোলা হয়েছে" : "ফর্ম পূরণ করতে এখানে ক্লিক করুন"}
                      </Button>

                      {formOpened && (
                        <div className="mt-4">
                          <div className="bg-gray-50 p-4 border-l-4 border-red-500 rounded-md mb-4">
                            <p className="text-sm">
                              দয়া করে Google Form পূরণ করুন এবং সাবমিট করুন। ফর্ম সাবমিট করার পর এই পৃষ্ঠায় ফিরে আসুন।
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 mb-4">
                            <Checkbox 
                              id="formSubmitted" 
                              checked={formSubmitted} 
                              onCheckedChange={(checked) => setFormSubmitted(checked === true)}
                            />
                            <label htmlFor="formSubmitted" className="text-sm font-medium">
                              আমি Google Form সফলভাবে সাবমিট করেছি
                            </label>
                          </div>

                          <Button
                            className="w-full bg-red-600 hover:bg-red-700"
                            disabled={!formSubmitted}
                            onClick={handleRequestCertificate}
                          >
                            সার্টিফিকেট অনুরোধ করুন
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-md">
                        <p className="text-sm">
                          আপনার অনুরোধ সফলভাবে জমা হয়েছে। এডমিন অনুমোদনের পর আপনি সার্টিফিকেট ডাউনলোড করতে পারবেন।
                        </p>
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        onClick={checkStatus}
                        disabled={checkingStatus}
                      >
                        {checkingStatus ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>চেক করা হচ্ছে...</span>
                          </div>
                        ) : (
                          "স্টেটাস চেক করুন"
                        )}
                      </Button>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700" 
                        onClick={downloadCertificate}
                        disabled={downloading || certificateStatus !== "approved"}
                      >
                        {downloading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>ডাউনলোড হচ্ছে...</span>
                          </div>
                        ) : (
                          "সার্টিফিকেট ডাউনলোড করুন"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin">
            <AdminPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
