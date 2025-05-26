
import React, { useState, useRef } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera as CameraIcon, Image, RotateCcw, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ScanResult {
  id: string;
  timestamp: Date;
  imageUrl: string;
  what3wordsAddress: string;
  confidence: number;
  supabaseImagePath?: string;
}

const ScannerInterface = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);

  const mockOCRScan = async (imageUrl: string): Promise<{ address: string; confidence: number }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock what3words addresses for demo
    const mockAddresses = [
      'filled.count.soap',
      'index.home.raft',
      'daring.lion.race',
      'family.open.today',
      'laptop.green.view'
    ];
    
    const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-99% confidence
    
    return { address: randomAddress, confidence };
  };

  const uploadImageToSupabase = async (dataUrl: string): Promise<string | null> => {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Generate unique filename
      const fileName = `parcel_${Date.now()}.jpg`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('parcel-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        toast.error('Failed to save image to storage');
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('parcel-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process image upload');
      return null;
    }
  };

  const handleCapture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        setCapturedImage(image.dataUrl);
        setIsScanning(true);
        
        toast.info('Scanning image and saving to storage...');

        try {
          // Upload image to Supabase in parallel with OCR scanning
          const [ocrResult, supabaseUrl] = await Promise.all([
            mockOCRScan(image.dataUrl),
            uploadImageToSupabase(image.dataUrl)
          ]);
          
          const newScanResult: ScanResult = {
            id: Date.now().toString(),
            timestamp: new Date(),
            imageUrl: supabaseUrl || image.dataUrl, // Fallback to local if upload fails
            what3wordsAddress: ocrResult.address,
            confidence: ocrResult.confidence,
            supabaseImagePath: supabaseUrl ? supabaseUrl.split('/').pop() : undefined
          };

          setCurrentResult(newScanResult);
          setScanResults(prev => [newScanResult, ...prev]);
          
          const storageMessage = supabaseUrl ? ' (saved to cloud storage)' : ' (local only)';
          toast.success(`Address found: ${ocrResult.address} (${ocrResult.confidence}% confidence)${storageMessage}`);
        } catch (error) {
          toast.error('Failed to scan image. Please try again.');
        } finally {
          setIsScanning(false);
        }
      }
    } catch (error) {
      toast.error('Camera access failed. Please check permissions.');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCurrentResult(null);
    setIsScanning(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
      {/* Camera/Preview Section */}
      <div className="flex-1">
        <Card className="p-6 h-full min-h-[500px]">
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CameraIcon className="w-6 h-6" />
              Scanner
            </h2>
            
            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 relative overflow-hidden">
              {capturedImage ? (
                <div className="relative w-full h-full">
                  <img 
                    src={capturedImage} 
                    alt="Captured parcel" 
                    className="w-full h-full object-contain"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <span className="font-medium">Scanning and saving...</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">No image captured</p>
                  <p className="text-sm text-gray-500">Tap the camera button to start scanning</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <Button 
                onClick={handleCapture}
                disabled={isScanning}
                className="flex-1"
                size="lg"
              >
                <CameraIcon className="w-5 h-5 mr-2" />
                {capturedImage ? 'Capture New' : 'Start Scanning'}
              </Button>
              
              {capturedImage && (
                <Button 
                  onClick={handleRetake}
                  variant="outline"
                  disabled={isScanning}
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Retake
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Results Section */}
      <div className="flex-1">
        <Card className="p-6 h-full">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Results
          </h2>
          
          {currentResult ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-800">what3words Address Found</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {currentResult.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-2xl font-mono font-bold text-green-900 mb-2">
                  ///{currentResult.what3wordsAddress}
                </p>
                <p className="text-sm text-green-700">
                  Scanned at {currentResult.timestamp.toLocaleTimeString()}
                  {currentResult.supabaseImagePath && (
                    <span className="ml-2 text-xs bg-green-200 px-2 py-1 rounded">
                      Saved to cloud
                    </span>
                  )}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Recent Scans</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {scanResults.slice(0, 5).map((result) => (
                    <div 
                      key={result.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setCurrentResult(result)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-sm">
                          ///{result.what3wordsAddress}
                        </span>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {result.confidence}%
                          </Badge>
                          {result.supabaseImagePath && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              Cloud
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {result.timestamp.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <MapPin className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">No scans yet</p>
              <p className="text-sm text-gray-500">
                Capture an image to start scanning for what3words addresses
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ScannerInterface;
