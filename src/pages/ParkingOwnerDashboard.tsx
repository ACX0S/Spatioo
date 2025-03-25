
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bell, 
  Building, 
  Calendar, 
  Car, 
  CreditCard, 
  DollarSign, 
  Edit, 
  FileText, 
  History, 
  Home, 
  LogOut, 
  MapPin, 
  ParkingCircle, 
  PlusCircle, 
  Settings, 
  Trash, 
  Upload, 
  User, 
  Users 
} from 'lucide-react';

// Mock parking facilities data
const PARKING_FACILITIES = [
  {
    id: '1',
    name: 'Downtown Secure Parking',
    address: '123 Main St, Downtown',
    totalSpots: 45,
    availableSpots: 12,
    bookedToday: 15,
    revenue: 324.50,
    status: 'active',
  },
  {
    id: '2',
    name: 'Central Park & Go',
    address: '456 Oak Ave, Central District',
    totalSpots: 60,
    availableSpots: 8,
    bookedToday: 27,
    revenue: 487.25,
    status: 'active',
  },
];

// Mock bookings data
const BOOKINGS = [
  {
    id: '1001',
    facility: 'Downtown Secure Parking',
    customerName: 'Michael Johnson',
    date: 'Today, 2:00 PM - 6:00 PM',
    price: '$22.00',
    status: 'active',
    spotNumber: 'A-15',
  },
  {
    id: '1002',
    facility: 'Central Park & Go',
    customerName: 'Sarah Williams',
    date: 'Today, 10:00 AM - 12:00 PM',
    price: '$8.50',
    status: 'completed',
    spotNumber: 'B-22',
  },
  {
    id: '1003',
    facility: 'Downtown Secure Parking',
    customerName: 'Robert Davis',
    date: 'Today, 4:00 PM - 8:00 PM',
    price: '$22.00',
    status: 'upcoming',
    spotNumber: 'A-08',
  },
  {
    id: '1004',
    facility: 'Central Park & Go',
    customerName: 'Jennifer Miller',
    date: 'Tomorrow, 9:00 AM - 11:00 AM',
    price: '$8.50',
    status: 'upcoming',
    spotNumber: 'C-15',
  },
];

const ParkingOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddFacilityForm, setShowAddFacilityForm] = useState(false);
  
  const totalRevenue = PARKING_FACILITIES.reduce((acc, facility) => acc + facility.revenue, 0);
  const totalBookings = BOOKINGS.length;
  const totalAvailableSpots = PARKING_FACILITIES.reduce((acc, facility) => acc + facility.availableSpots, 0);
  
  return (
    <div className="page-transition">
      <section className="py-8 md:py-12 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="p-6 rounded-xl glass-card">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-spatioo-green text-white">PC</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-bold">Parking Co.</h2>
                      <p className="text-sm text-muted-foreground">Business Account</p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        activeTab === 'dashboard' && "bg-secondary"
                      )}
                      onClick={() => setActiveTab('dashboard')}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        activeTab === 'facilities' && "bg-secondary"
                      )}
                      onClick={() => setActiveTab('facilities')}
                    >
                      <Building className="mr-2 h-4 w-4" />
                      Parking Facilities
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        activeTab === 'bookings' && "bg-secondary"
                      )}
                      onClick={() => setActiveTab('bookings')}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Bookings
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        activeTab === 'revenue' && "bg-secondary"
                      )}
                      onClick={() => setActiveTab('revenue')}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Revenue
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        activeTab === 'notifications' && "bg-secondary"
                      )}
                      onClick={() => setActiveTab('notifications')}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                      <Badge className="ml-auto bg-spatioo-green text-white">3</Badge>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        activeTab === 'settings' && "bg-secondary"
                      )}
                      onClick={() => setActiveTab('settings')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </div>
                  <div className="mt-6 pt-6 border-t">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
                
                <div className="p-6 rounded-xl border bg-background">
                  <h3 className="font-medium mb-3">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Questions about managing your parking facilities or account? Our business support team is ready to assist.
                  </p>
                  <Button variant="outline" className="w-full">
                    Business Support
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-4">
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Business Dashboard</h1>
                    <Button className="bg-spatioo-green hover:bg-spatioo-green-dark text-white">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Facility
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          +15.3% from last month
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Active Bookings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalBookings}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          +8.2% from last month
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Available Spots
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalAvailableSpots}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Across {PARKING_FACILITIES.length} facilities
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Customer Satisfaction
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">4.8/5</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on 126 reviews
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>
                          Daily revenue for the past 30 days
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] rounded-xl bg-muted flex items-center justify-center">
                          <BarChart className="h-12 w-12 text-muted-foreground" />
                          <span className="ml-2 text-muted-foreground">
                            Revenue Chart Placeholder
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>
                          Latest parking reservations
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {BOOKINGS.slice(0, 3).map(booking => (
                            <div key={booking.id} className="flex items-center">
                              <div className="mr-4 rounded-full w-8 h-8 bg-muted flex items-center justify-center">
                                <Car className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium">{booking.customerName}</p>
                                <p className="text-xs text-muted-foreground">{booking.facility}</p>
                              </div>
                              <Badge 
                                className={cn(
                                  "ml-auto",
                                  booking.status === 'active' 
                                    ? "bg-green-500 hover:bg-green-600" 
                                    : booking.status === 'upcoming'
                                    ? "bg-blue-500 hover:bg-blue-600"
                                    : "bg-gray-500 hover:bg-gray-600"
                                )}
                              >
                                {booking.status === 'active' 
                                  ? 'Active' 
                                  : booking.status === 'upcoming'
                                  ? 'Upcoming'
                                  : 'Completed'}
                              </Badge>
                            </div>
                          ))}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-center text-muted-foreground hover:text-foreground"
                            onClick={() => setActiveTab('bookings')}
                          >
                            View All Bookings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Parking Facilities</CardTitle>
                      <CardDescription>
                        Manage your parking locations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {PARKING_FACILITIES.map(facility => (
                          <div key={facility.id} className="p-4 rounded-lg border bg-background">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <h3 className="font-bold text-foreground">{facility.name}</h3>
                                  <Badge className="ml-2 bg-green-500 hover:bg-green-600">
                                    Active
                                  </Badge>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span className="text-sm">{facility.address}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-muted-foreground">
                                    Total Spots: {facility.totalSpots}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    Available: {facility.availableSpots}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col md:items-end gap-2">
                                <div className="text-lg font-bold text-spatioo-green">
                                  ${facility.revenue.toFixed(2)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {facility.bookedToday} bookings today
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Manage Spots
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button 
                          className="w-full justify-center border-dashed"
                          variant="outline"
                          onClick={() => setShowAddFacilityForm(true)}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add New Parking Facility
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {activeTab === 'facilities' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Parking Facilities</h1>
                    <Button 
                      className="bg-spatioo-green hover:bg-spatioo-green-dark text-white"
                      onClick={() => setShowAddFacilityForm(true)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Facility
                    </Button>
                  </div>
                  
                  {showAddFacilityForm ? (
                    <Card className="border-2 border-spatioo-green/50">
                      <CardHeader>
                        <CardTitle>Add New Parking Facility</CardTitle>
                        <CardDescription>
                          Enter the details of your new parking location
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Facility Name</label>
                              <Input placeholder="e.g. Central Business Parking" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Address</label>
                              <Input placeholder="Full street address" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">City</label>
                              <Input placeholder="City" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">State/Province</label>
                              <Input placeholder="State" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">ZIP/Postal Code</label>
                              <Input placeholder="ZIP Code" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Total Parking Spots</label>
                              <Input type="number" placeholder="e.g. 50" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Price per Hour ($)</label>
                              <Input type="number" placeholder="e.g. 5.00" step="0.01" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea 
                              className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                              placeholder="Describe your parking facility and any special features..."
                            ></textarea>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Facility Photos</label>
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center">
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground mb-2">
                                Drag and drop files here, or click to browse
                              </p>
                              <Button variant="outline" size="sm">
                                Upload Photos
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Amenities & Features</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              <div className="flex items-center">
                                <input type="checkbox" id="covered" className="mr-2" />
                                <label htmlFor="covered" className="text-sm">Covered Parking</label>
                              </div>
                              <div className="flex items-center">
                                <input type="checkbox" id="security" className="mr-2" />
                                <label htmlFor="security" className="text-sm">24/7 Security</label>
                              </div>
                              <div className="flex items-center">
                                <input type="checkbox" id="ev" className="mr-2" />
                                <label htmlFor="ev" className="text-sm">EV Charging</label>
                              </div>
                              <div className="flex items-center">
                                <input type="checkbox" id="accessible" className="mr-2" />
                                <label htmlFor="accessible" className="text-sm">Accessible Spots</label>
                              </div>
                              <div className="flex items-center">
                                <input type="checkbox" id="valet" className="mr-2" />
                                <label htmlFor="valet" className="text-sm">Valet Service</label>
                              </div>
                              <div className="flex items-center">
                                <input type="checkbox" id="camera" className="mr-2" />
                                <label htmlFor="camera" className="text-sm">Security Cameras</label>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2 pt-4">
                            <Button 
                              variant="outline" 
                              onClick={() => setShowAddFacilityForm(false)}
                            >
                              Cancel
                            </Button>
                            <Button className="bg-spatioo-green hover:bg-spatioo-green-dark text-white">
                              Add Facility
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {PARKING_FACILITIES.map(facility => (
                        <Card key={facility.id}>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <div>
                                <CardTitle>{facility.name}</CardTitle>
                                <CardDescription>
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  {facility.address}
                                </CardDescription>
                              </div>
                              <Badge className="bg-green-500 hover:bg-green-600">
                                Active
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                              <div className="flex flex-col items-center p-4 rounded-lg border">
                                <div className="text-2xl font-bold">{facility.totalSpots}</div>
                                <div className="text-sm text-muted-foreground">Total Spots</div>
                              </div>
                              <div className="flex flex-col items-center p-4 rounded-lg border">
                                <div className="text-2xl font-bold text-spatioo-green">{facility.availableSpots}</div>
                                <div className="text-sm text-muted-foreground">Available Now</div>
                              </div>
                              <div className="flex flex-col items-center p-4 rounded-lg border">
                                <div className="text-2xl font-bold">{facility.bookedToday}</div>
                                <div className="text-sm text-muted-foreground">Bookings Today</div>
                              </div>
                              <div className="flex flex-col items-center p-4 rounded-lg border">
                                <div className="text-2xl font-bold text-spatioo-green">${facility.revenue.toFixed(2)}</div>
                                <div className="text-sm text-muted-foreground">Revenue Today</div>
                              </div>
                            </div>
                            
                            <div className="mt-6 flex justify-between">
                              <div className="flex space-x-2">
                                <Button variant="outline">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Details
                                </Button>
                                <Button variant="outline">
                                  <ParkingCircle className="h-4 w-4 mr-2" />
                                  Manage Spots
                                </Button>
                                <Button variant="outline">
                                  <Users className="h-4 w-4 mr-2" />
                                  Booking History
                                </Button>
                              </div>
                              <Button variant="outline" className="text-red-500 hover:text-red-700">
                                <Trash className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-10">
                          <Building className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Add Another Facility</h3>
                          <p className="text-muted-foreground text-center max-w-md mb-4">
                            Increase your capacity and revenue by adding another parking facility to your account.
                          </p>
                          <Button 
                            className="bg-spatioo-green hover:bg-spatioo-green-dark text-white"
                            onClick={() => setShowAddFacilityForm(true)}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Facility
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Bookings</h1>
                    <div className="flex gap-2">
                      <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>All Facilities</option>
                        <option>Downtown Secure Parking</option>
                        <option>Central Park & Go</option>
                      </select>
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="all">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="space-y-4 pt-4">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Input placeholder="Search bookings..." className="w-64" />
                          <Button variant="outline" size="icon">
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Sort by:
                          </span>
                          <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option>Newest First</option>
                            <option>Oldest First</option>
                            <option>Price: High to Low</option>
                            <option>Price: Low to High</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {BOOKINGS.map(booking => (
                          <div key={booking.id} className="p-4 rounded-lg border bg-background">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <h3 className="font-bold text-foreground">{booking.customerName}</h3>
                                  <Badge 
                                    className={cn(
                                      "ml-2",
                                      booking.status === 'active' 
                                        ? "bg-green-500 hover:bg-green-600" 
                                        : booking.status === 'upcoming'
                                        ? "bg-blue-500 hover:bg-blue-600"
                                        : "bg-gray-500 hover:bg-gray-600"
                                    )}
                                  >
                                    {booking.status === 'active' 
                                      ? 'Active' 
                                      : booking.status === 'upcoming'
                                      ? 'Upcoming'
                                      : 'Completed'}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <Building className="h-4 w-4 mr-1" />
                                  <span className="text-sm">{booking.facility}</span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span className="text-sm">{booking.date}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col md:items-end gap-2">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-spatioo-green">{booking.price}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Spot: {booking.spotNumber}
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <User className="h-3 w-3 mr-1" />
                                    Customer Info
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-center mt-6">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" disabled>
                            Previous
                          </Button>
                          <Button variant="outline" size="sm" className="bg-secondary">
                            1
                          </Button>
                          <Button variant="outline" size="sm">
                            2
                          </Button>
                          <Button variant="outline" size="sm">
                            3
                          </Button>
                          <Button variant="outline" size="sm">
                            Next
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="active" className="pt-4">
                      <div className="p-8 text-center">
                        <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Active Bookings</h3>
                        <p className="text-muted-foreground mb-4">
                          Content for active bookings tab would be displayed here.
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="upcoming" className="pt-4">
                      <div className="p-8 text-center">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Upcoming Bookings</h3>
                        <p className="text-muted-foreground mb-4">
                          Content for upcoming bookings tab would be displayed here.
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="completed" className="pt-4">
                      <div className="p-8 text-center">
                        <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Completed Bookings</h3>
                        <p className="text-muted-foreground mb-4">
                          Content for completed bookings tab would be displayed here.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Revenue Reports</h1>
                    <div className="flex gap-2">
                      <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>Last 30 Days</option>
                        <option>This Month</option>
                        <option>Last Month</option>
                        <option>This Year</option>
                      </select>
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-green-500 mt-1">
                          +15.3% from last period
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Average Daily Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$27.01</div>
                        <p className="text-xs text-green-500 mt-1">
                          +5.7% from last period
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Occupancy Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">68%</div>
                        <p className="text-xs text-green-500 mt-1">
                          +8.2% from last period
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Trends</CardTitle>
                      <CardDescription>
                        Revenue breakdown over the past 30 days
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] rounded-xl bg-muted flex items-center justify-center">
                        <BarChart className="h-12 w-12 text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">
                          Revenue Trends Chart Placeholder
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue by Facility</CardTitle>
                        <CardDescription>
                          Revenue distribution across parking facilities
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] rounded-xl bg-muted flex items-center justify-center">
                          <PieChart className="h-12 w-12 text-muted-foreground" />
                          <span className="ml-2 text-muted-foreground">
                            Revenue by Facility Chart Placeholder
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue by Time of Day</CardTitle>
                        <CardDescription>
                          When your parking spots generate the most revenue
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] rounded-xl bg-muted flex items-center justify-center">
                          <BarChart className="h-12 w-12 text-muted-foreground" />
                          <span className="ml-2 text-muted-foreground">
                            Revenue by Time Chart Placeholder
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ParkingOwnerDashboard;
