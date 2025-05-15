
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { loadCertificateRequests, updateCertificateRequestStatus, CertificateRequest } from "@/data/certificateRequests";
import { Loader2 } from "lucide-react";

const AdminPanel = () => {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Simple password for demo purposes - in a real app, you'd use proper auth
  const adminPassword = "admin123";

  useEffect(() => {
    if (authenticated) {
      fetchCertificateRequests();
    }
  }, [authenticated]);

  const fetchCertificateRequests = async () => {
    setLoading(true);
    const data = await loadCertificateRequests();
    setRequests(data);
    setLoading(false);
  };

  const handleLogin = () => {
    if (password === adminPassword) {
      setAuthenticated(true);
      toast({
        title: "সফল প্রবেশ",
        description: "আপনি এডমিন প্যানেলে সফলভাবে লগইন করেছেন।",
      });
    } else {
      toast({
        title: "ভুল পাসওয়ার্ড",
        description: "দয়া করে সঠিক পাসওয়ার্ড দিন।",
        variant: "destructive",
      });
    }
  };

  const approveCertificate = async (id: string) => {
    const success = await updateCertificateRequestStatus(id, "approved");
    if (success) {
      // Update the local state to reflect the change
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: "approved" } : req
      ));
      
      toast({
        title: "অনুমোদিত",
        description: `সার্টিফিকেট অনুমোদিত হয়েছে।`,
        variant: "default",
      });
    }
  };

  const rejectCertificate = async (id: string) => {
    const success = await updateCertificateRequestStatus(id, "rejected");
    if (success) {
      // Update the local state to reflect the change
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: "rejected" } : req
      ));
      
      toast({
        title: "প্রত্যাখ্যাত",
        description: `সার্টিফিকেট প্রত্যাখ্যাত হয়েছে।`,
        variant: "destructive",
      });
    }
  };

  if (!authenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>এডমিন লগইন</CardTitle>
          <CardDescription>অনুগ্রহ করে এডমিন প্যানেল অ্যাক্সেস করতে পাসওয়ার্ড দিন</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="পাসওয়ার্ড দিন"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full" onClick={handleLogin}>
              লগইন
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>এডমিন প্যানেল</CardTitle>
        <CardDescription>
          সার্টিফিকেট অনুরোধগুলি অনুমোদন বা প্রত্যাখ্যান করুন
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : requests.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>নাম</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead>স্টেটাস</TableHead>
                <TableHead>একশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.name}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>
                    {request.status === "pending" ? (
                      <Badge className="bg-yellow-500">অপেক্ষমান</Badge>
                    ) : request.status === "approved" ? (
                      <Badge className="bg-green-500">অনুমোদিত</Badge>
                    ) : (
                      <Badge className="bg-red-500">প্রত্যাখ্যাত</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {request.status === "pending" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approveCertificate(request.id)}
                        >
                          অনুমোদন
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => rejectCertificate(request.id)}
                        >
                          প্রত্যাখ্যান
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-gray-500">
            কোন অনুরোধ পাওয়া যায়নি
          </div>
        )}
        
        <Button onClick={fetchCertificateRequests} className="mt-4">
          রিফ্রেশ করুন
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminPanel;
