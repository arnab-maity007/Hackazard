
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Fingerprint } from "lucide-react";

interface DigiLockerVerificationProps {
  onVerificationComplete: (verified: boolean) => void;
}

const DigiLockerVerification: React.FC<DigiLockerVerificationProps> = ({ onVerificationComplete }) => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();

  const handleSendOTP = async () => {
    // Placeholder for DigiLocker OTP generation
    if (aadhaarNumber.length !== 12) {
      toast({
        title: "Invalid Aadhaar Number",
        description: "Please enter a valid 12-digit Aadhaar number",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate OTP generation
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "OTP has been sent to your registered mobile number",
      });
    } catch (error) {
      toast({
        title: "OTP Generation Failed",
        description: "Unable to send OTP. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate OTP verification
      onVerificationComplete(true);
      toast({
        title: "Verification Successful",
        description: "Your identity has been verified through DigiLocker",
      });
    } catch (error) {
      onVerificationComplete(false);
      toast({
        title: "Verification Failed",
        description: "OTP verification unsuccessful. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Fingerprint className="h-6 w-6 text-theme-accent-300" />
        <h3 className="text-lg font-semibold">DigiLocker Verification</h3>
      </div>
      
      <Input 
        type="text" 
        placeholder="Enter Aadhaar Number" 
        value={aadhaarNumber}
        onChange={(e) => setAadhaarNumber(e.target.value)}
        maxLength={12}
        disabled={otpSent}
      />
      
      {!otpSent ? (
        <Button 
          onClick={handleSendOTP} 
          className="w-full"
          disabled={aadhaarNumber.length !== 12}
        >
          Send OTP
        </Button>
      ) : (
        <>
          <Input 
            type="text" 
            placeholder="Enter 6-digit OTP" 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />
          <Button 
            onClick={handleVerifyOTP} 
            className="w-full"
            disabled={otp.length !== 6}
          >
            Verify OTP
          </Button>
        </>
      )}
    </div>
  );
};

export default DigiLockerVerification;
