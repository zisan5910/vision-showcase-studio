
// This file interfaces with our Supabase database

import { supabase } from "@/integrations/supabase/client";

export interface CertificateRequest {
  id: string;
  name: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

// Initial data for demo purposes
export const certificateRequests: CertificateRequest[] = [
  {
    id: "sample1",
    name: "কামরুল হাসান",
    date: "2025-05-10",
    status: "approved",
  },
  {
    id: "sample2",
    name: "জসিম উদ্দিন",
    date: "2025-05-12",
    status: "pending",
  },
  {
    id: "sample3",
    name: "সাবরিনা আক্তার",
    date: "2025-05-14",
    status: "rejected",
  },
];

// Function to load certificate requests from Supabase
export async function loadCertificateRequests() {
  try {
    const { data, error } = await supabase
      .from("certificate_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading certificate requests:", error);
      return [];
    }

    // Convert Supabase data to our interface
    return data.map(item => ({
      id: item.id,
      name: item.name,
      date: new Date(item.date).toLocaleDateString(),
      status: item.status as "pending" | "approved" | "rejected"
    }));
  } catch (err) {
    console.error("Failed to load certificate requests:", err);
    return [];
  }
}

// Function to create a new certificate request
export async function createCertificateRequest(name: string, userDetails: any = {}) {
  try {
    const { data, error } = await supabase
      .from("certificate_requests")
      .insert([
        { 
          name,
          status: "pending",
          user_details: userDetails
        }
      ])
      .select();

    if (error) {
      console.error("Error creating certificate request:", error);
      return null;
    }

    return {
      id: data[0].id,
      name: data[0].name,
      date: new Date(data[0].date).toLocaleDateString(),
      status: data[0].status as "pending" | "approved" | "rejected"
    };
  } catch (err) {
    console.error("Failed to create certificate request:", err);
    return null;
  }
}

// Function to update a certificate request status
export async function updateCertificateRequestStatus(id: string, status: "pending" | "approved" | "rejected") {
  try {
    const { error } = await supabase
      .from("certificate_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Error updating certificate request:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Failed to update certificate request:", err);
    return false;
  }
}

// Function to find a certificate request by name
export async function findCertificateRequestByName(name: string) {
  try {
    const { data, error } = await supabase
      .from("certificate_requests")
      .select("*")
      .ilike("name", name)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    return {
      id: data[0].id,
      name: data[0].name,
      date: new Date(data[0].date).toLocaleDateString(),
      status: data[0].status as "pending" | "approved" | "rejected"
    };
  } catch (err) {
    console.error("Failed to find certificate request:", err);
    return null;
  }
}
