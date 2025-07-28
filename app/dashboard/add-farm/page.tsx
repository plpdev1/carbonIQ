'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Leaf, ArrowLeft, MapPin, Sprout, Calendar, Camera, Zap, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const FarmMap = dynamic(() => import('@/components/FarmMap'), { ssr: false });

const cropTypes = [
  'Maize', 'Wheat', 'Rice', 'Soybeans', 'Barley', 'Oats', 'Sorghum', 'Millet',
  'Cassava', 'Sweet Potato', 'Yam', 'Plantain', 'Banana', 'Coffee', 'Cocoa',
  'Tea', 'Sugar Cane', 'Cotton', 'Tobacco', 'Vegetables', 'Fruits', 'Other'
];

const farmingPractices = [
  'No-till farming', 'Cover cropping', 'Crop rotation', 'Agroforestry',
  'Organic farming', 'Integrated pest management', 'Composting',
  'Water conservation', 'Soil conservation', 'Silvopasture',
  'Rotational grazing', 'Biochar application', 'Green manuring'
];

export default function AddFarmPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Form data
  const [farmName, setFarmName] = useState('');
  const [landSize, setLandSize] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);
  const [plantingDate, setPlantingDate] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [boundaryData, setBoundaryData] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/auth');
      return;
    }

    setUser(session.user);
  };

  const handleCropToggle = (crop: string) => {
    setSelectedCrops(prev => 
      prev.includes(crop) 
        ? prev.filter(c => c !== crop)
        : [...prev, crop]
    );
  };

  const handlePracticeToggle = (practice: string) => {
    setSelectedPractices(prev => 
      prev.includes(practice) 
        ? prev.filter(p => p !== practice)
        : [...prev, practice]
    );
  };

  const handleLocationUpdate = (coords: [number, number], boundary: any) => {
    setCoordinates(coords);
    setBoundaryData(boundary);
  };

  const simulateAIVerification = async (farmData: any) => {
    // Simulate AI verification process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Enhanced AI verification with rejection logic
    const rejectionReasons = [];
    
    // Check land size requirements
    if (farmData.land_size < 0.5) {
      rejectionReasons.push("Land size too small (minimum 0.5 hectares required)");
    }
    
    // Check farming practices
    if (farmData.farming_practices.length < 2) {
      rejectionReasons.push("Insufficient sustainable farming practices (minimum 2 required)");
    }
    
    // Check crop types for carbon sequestration potential
    const lowCarbonCrops = ['Cotton', 'Tobacco'];
    const hasLowCarbonCrops = farmData.crop_types.some((crop: string) => lowCarbonCrops.includes(crop));
    if (hasLowCarbonCrops && farmData.crop_types.length === 1) {
      rejectionReasons.push("Selected crops have low carbon sequestration potential");
    }
    
    // Check coordinates validity
    if (!farmData.coordinates || farmData.coordinates[0] === 0 || farmData.coordinates[1] === 0) {
      rejectionReasons.push("Invalid or missing GPS coordinates");
    }
    
    // Random rejection for demonstration (10% chance)
    if (Math.random() < 0.1) {
      rejectionReasons.push("Satellite imagery analysis shows inconsistent land use patterns");
    }
    
    // If there are rejection reasons, return rejected status
    if (rejectionReasons.length > 0) {
      return {
        carbon_credits: null,
        confidence_score: null,
        verification_status: 'rejected',
        rejection_reasons: rejectionReasons
      };
    }
    
    // Calculate carbon credits for approved farms
    const baseCredits = farmData.land_size * 0.5;
    const practiceMultiplier = 1 + (farmData.farming_practices.length * 0.1);
    const carbonCredits = baseCredits * practiceMultiplier;
    
    return {
      carbon_credits: Math.round(carbonCredits * 10) / 10,
      confidence_score: 0.85 + Math.random() * 0.1, // Random confidence between 85-95%
      verification_status: 'verified',
      rejection_reasons: null
    };
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      const farmData = {
        user_id: user.id,
        name: farmName,
        land_size: parseFloat(landSize),
        coordinates: coordinates,
        boundary_data: boundaryData,
        crop_types: selectedCrops,
        farming_practices: selectedPractices,
        planting_date: plantingDate,
        verification_status: 'pending' as const
      };

      // Insert farm data
      const { data, error } = await supabase
        .from('farms')
        .insert([farmData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Farm data submitted successfully!');
      
      // Simulate AI verification
      toast.loading('AI verification in progress...', { id: 'verification' });
      
      const verificationResult = await simulateAIVerification(farmData);
      
      // Update farm with verification results
      const { error: updateError } = await supabase
        .from('farms')
        .update(verificationResult)
        .eq('id', data.id);

      if (updateError) throw updateError;

      if (verificationResult.verification_status === 'verified') {
        toast.success('Farm verified successfully!', { id: 'verification' });
      } else {
        toast.error(`Verification failed: ${verificationResult.rejection_reasons?.join(', ')}`, { id: 'verification' });
      }
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error: any) {
      toast.error(error.message || 'Error submitting farm data');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return farmName && landSize && selectedCrops.length > 0;
      case 2:
        return coordinates !== null; // Only require coordinates, boundary is optional
      case 3:
        return selectedPractices.length > 0 && plantingDate;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2 text-green-600 hover:text-green-700">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Leaf className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold text-green-800">CarbonIQ</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Your Farm</h1>
          <p className="text-gray-600">Provide details about your farm for carbon credit verification</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="w-full h-2" />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span className={currentStep >= 1 ? 'text-green-600 font-medium' : ''}>Basic Info</span>
            <span className={currentStep >= 2 ? 'text-green-600 font-medium' : ''}>Location</span>
            <span className={currentStep >= 3 ? 'text-green-600 font-medium' : ''}>Practices</span>
            <span className={currentStep >= 4 ? 'text-green-600 font-medium' : ''}>Review</span>
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-green-200 shadow-lg">
          {currentStep === 1 && (
            <>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Sprout className="h-6 w-6 text-green-600" />
                  <CardTitle>Basic Farm Information</CardTitle>
                </div>
                <CardDescription>
                  Tell us about your farm's basic details and crops
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="farm-name">Farm Name *</Label>
                  <Input
                    id="farm-name"
                    placeholder="e.g., Green Valley Farm"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="land-size">Land Size (hectares) *</Label>
                  <Input
                    id="land-size"
                    type="number"
                    placeholder="e.g., 2.5"
                    value={landSize}
                    onChange={(e) => setLandSize(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Crop Types *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {cropTypes.map((crop) => (
                      <div key={crop} className="flex items-center space-x-2">
                        <Checkbox
                          id={crop}
                          checked={selectedCrops.includes(crop)}
                          onCheckedChange={() => handleCropToggle(crop)}
                        />
                        <Label htmlFor={crop} className="text-sm">{crop}</Label>
                      </div>
                    ))}
                  </div>
                  {selectedCrops.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedCrops.map((crop) => (
                        <Badge key={crop} variant="secondary">{crop}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 2 && (
            <>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-6 w-6 text-green-600" />
                  <CardTitle>Farm Location</CardTitle>
                </div>
                <CardDescription>
                  Mark your farm's location and draw the boundaries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FarmMap onLocationUpdate={handleLocationUpdate} />
                {coordinates && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Farm location marked at coordinates: {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {currentStep === 3 && (
            <>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-6 w-6 text-green-600" />
                  <CardTitle>Farming Practices & Timeline</CardTitle>
                </div>
                <CardDescription>
                  Share your sustainable farming practices and planting schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="planting-date">Planting Date *</Label>
                  <Input
                    id="planting-date"
                    type="date"
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Sustainable Farming Practices *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {farmingPractices.map((practice) => (
                      <div key={practice} className="flex items-center space-x-2">
                        <Checkbox
                          id={practice}
                          checked={selectedPractices.includes(practice)}
                          onCheckedChange={() => handlePracticeToggle(practice)}
                        />
                        <Label htmlFor={practice} className="text-sm">{practice}</Label>
                      </div>
                    ))}
                  </div>
                  {selectedPractices.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedPractices.map((practice) => (
                        <Badge key={practice} variant="secondary">{practice}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 4 && (
            <>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-green-600" />
                  <CardTitle>Review & Submit</CardTitle>
                </div>
                <CardDescription>
                  Review your farm details before AI verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Farm Name</Label>
                      <p className="text-lg font-semibold">{farmName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Land Size</Label>
                      <p className="text-lg font-semibold">{landSize} hectares</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Planting Date</Label>
                      <p className="text-lg font-semibold">{new Date(plantingDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Location</Label>
                      <p className="text-lg font-semibold">
                        {coordinates ? `${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}` : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Crop Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCrops.map((crop) => (
                      <Badge key={crop} className="bg-green-100 text-green-800">{crop}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Farming Practices</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPractices.map((practice) => (
                      <Badge key={practice} className="bg-blue-100 text-blue-800">{practice}</Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What happens next?
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <Zap className="h-4 w-4 text-green-600 mr-2" />
                      AI analysis of your farm data and satellite imagery
                    </li>
                    <li className="flex items-center">
                      <Zap className="h-4 w-4 text-green-600 mr-2" />
                      Carbon sequestration estimation using IPCC methodology
                    </li>
                    <li className="flex items-center">
                      <Zap className="h-4 w-4 text-green-600 mr-2" />
                      Verification results typically available within minutes
                    </li>
                  </ul>
                </div>
              </CardContent>
            </>
          )}

          <div className="flex justify-between items-center p-6 bg-gray-50 border-t">
            {currentStep > 1 && (
              <Button onClick={prevStep} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            
            {currentStep < 4 ? (
              <Button 
                onClick={nextStep} 
                disabled={!isStepValid(currentStep)}
                className={`ml-auto bg-green-600 hover:bg-green-700 ${currentStep === 1 ? 'ml-auto' : ''}`}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="ml-auto bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Submitting...' : 'Submit for Verification'}
                <Zap className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}