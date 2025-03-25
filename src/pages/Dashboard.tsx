
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Bell, Car, CreditCard, History, LogOut, MapPin, Settings, Star, User } from 'lucide-react';

// Mock bookings data
const ACTIVE_BOOKINGS = [
  {
    id: '1001',
    parkingName: 'Downtown Secure Parking',
    address: '123 Main St, Downtown',
    date: 'Today, 2:00 PM - 6:00 PM',
    price: '$22.00',
    status: 'active',
    spotNumber: 'A-15',
    timeRemaining: '2h 15m',
  },
  {
    id: '1002',
    parkingName: 'Central Park & Go',
    address: '456 Oak Ave, Central District',
    date: 'Tomorrow, 9:00 AM - 11:00 AM',
    price: '$8.50',
    status: 'upcoming',
    spotNumber: 'B-22',
    timeRemaining: null,
  }
];

const BOOKING_HISTORY = [
  {
    id: '997',
    parkingName: 'Riverside Parking Complex',
    address: '789 River Rd, East Side',
    date: 'Jul 15, 2023, 3:00 PM - 5:00 PM',
    price: '$7.50',
    status: 'completed',
  },
  {
    id: '998',
    parkingName: 'Downtown Secure Parking',
    address: '123 Main St, Downtown',
    date: 'Jul 10, 2023, 10:00 AM - 2:00 PM',
    price: '$22.00',
    status: 'completed',
  },
  {
    id: '999',
    parkingName: 'North Station Parking',
    address: '234 Station Blvd, North District',
    date: 'Jul 5, 2023, 12:00 PM - 4:00 PM',
    price: '$16.00',
    status: 'cancelled',
  }
];

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Upcoming Reservation',
    message: 'Your parking at Central Park & Go is tomorrow at 9:00 AM.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    title: 'Special Offer',
    message: 'Get 20% off your next booking with code SPATIOO20.',
    time: '1 day ago',
    read: true,
  },
  {
    id: '3',
    title: 'Payment Confirmed',
    message: 'Your payment of $22.00 for Downtown Secure Parking has been processed.',
    time: '2 days ago',
    read: true,
  }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  
  return (
    <div className="page-transition">
      <section className="py-8 md:py-12 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="p-6 rounded-xl glass-card">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-spatioo-green text-white">JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-bold">John Doe</h2>
                      <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        activeTab === 'bookings' && "bg-secondary"
                      )}
                      onClick={() => setActiveTab('bookings')}
                    >
                      <Car className="mr-2 h-4 w-4" />
                      My Bookings
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        activeTab === 'history' && "bg-secondary"
                      )}
                      onClick={() => setActiveTab('history')}
                    >
                      <History className="mr-2 h-4 w-4" />
                      Booking History
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
                      <Badge className="ml-auto bg-spatioo-green text-white">2</Badge>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        activeTab === 'payment' && "bg-secondary"
                      )}
                      onClick={() => setActiveTab('payment')}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment Methods
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        activeTab === 'profile' && "bg-secondary"
                      )}
                      onClick={() => setActiveTab('profile')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
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
                    Having issues with your booking or account? Our support team is here to help.
                  </p>
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">My Bookings</h1>
                    <Button asChild className="bg-spatioo-green hover:bg-spatioo-green-dark text-white">
                      <Link to="/explore">
                        Find Parking
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium">Active & Upcoming</h2>
                    {ACTIVE_BOOKINGS.length > 0 ? (
                      <div className="space-y-4">
                        {ACTIVE_BOOKINGS.map(booking => (
                          <div key={booking.id} className="p-6 rounded-xl glass-card card-hover">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <h3 className="font-bold text-foreground">{booking.parkingName}</h3>
                                  <Badge 
                                    className={cn(
                                      "ml-2",
                                      booking.status === 'active' 
                                        ? "bg-green-500 hover:bg-green-600" 
                                        : "bg-blue-500 hover:bg-blue-600"
                                    )}
                                  >
                                    {booking.status === 'active' ? 'Active Now' : 'Upcoming'}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span className="text-sm">{booking.address}</span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span className="text-sm">{booking.date}</span>
                                </div>
                                {booking.status === 'active' && (
                                  <div className="flex items-center text-spatioo-green font-medium">
                                    <span>Time remaining: {booking.timeRemaining}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-2">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-spatioo-green">{booking.price}</div>
                                  {booking.spotNumber && (
                                    <div className="text-sm text-muted-foreground">
                                      Spot: {booking.spotNumber}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center rounded-xl border bg-background">
                        <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Active Bookings</h3>
                        <p className="text-muted-foreground mb-4">
                          You don't have any active or upcoming parking reservations.
                        </p>
                        <Button asChild className="bg-spatioo-green hover:bg-spatioo-green-dark text-white">
                          <Link to="/explore">
                            Find Parking
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 rounded-xl border bg-background">
                    <h3 className="font-medium mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-secondary text-center">
                        <div className="text-2xl font-bold text-foreground">5</div>
                        <div className="text-sm text-muted-foreground">Total Bookings</div>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary text-center">
                        <div className="text-2xl font-bold text-foreground">$76.00</div>
                        <div className="text-sm text-muted-foreground">Total Spent</div>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary text-center">
                        <div className="text-2xl font-bold text-foreground">12</div>
                        <div className="text-sm text-muted-foreground">Hours Saved</div>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary text-center">
                        <div className="text-2xl font-bold text-spatioo-green">$24.50</div>
                        <div className="text-sm text-muted-foreground">Money Saved</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'history' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">Booking History</h1>
                  
                  <div className="space-y-4">
                    {BOOKING_HISTORY.map(booking => (
                      <div key={booking.id} className="p-6 rounded-xl border bg-background card-hover">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <h3 className="font-bold text-foreground">{booking.parkingName}</h3>
                              <Badge 
                                className={cn(
                                  "ml-2",
                                  booking.status === 'completed' 
                                    ? "bg-gray-500 hover:bg-gray-600" 
                                    : "bg-red-500 hover:bg-red-600"
                                )}
                              >
                                {booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                              </Badge>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="text-sm">{booking.address}</span>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              <span className="text-sm">{booking.date}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <div className="text-right">
                              <div className="text-lg font-bold">{booking.price}</div>
                              <div className="text-sm text-muted-foreground">
                                Booking ID: #{booking.id}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                View Receipt
                              </Button>
                              {booking.status === 'completed' && (
                                <Button variant="outline" size="sm">
                                  <Star className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <Button variant="outline" size="sm">
                      Mark All as Read
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {NOTIFICATIONS.map(notification => (
                      <div 
                        key={notification.id} 
                        className={cn(
                          "p-6 rounded-xl border card-hover",
                          notification.read 
                            ? "bg-background" 
                            : "bg-spatioo-green/5 border-spatioo-green/20"
                        )}
                      >
                        <div className="flex items-start">
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-2 mr-3 shrink-0",
                            notification.read ? "bg-muted" : "bg-spatioo-green"
                          )}></div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <h3 className="font-bold text-foreground">{notification.title}</h3>
                              <span className="text-xs text-muted-foreground">{notification.time}</span>
                            </div>
                            <p className="text-muted-foreground">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center">
                    <Button variant="outline">
                      Load More
                    </Button>
                  </div>
                </div>
              )}
              
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">Payment Methods</h1>
                  
                  <div className="p-8 text-center rounded-xl border bg-background">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Payment Methods</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't added any payment methods to your account yet.
                    </p>
                    <Button className="bg-spatioo-green hover:bg-spatioo-green-dark text-white">
                      Add Payment Method
                    </Button>
                  </div>
                </div>
              )}
              
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">Profile Settings</h1>
                  
                  <div className="p-6 rounded-xl border bg-background">
                    <h3 className="font-medium mb-4">Personal Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">First Name</label>
                          <Input value="John" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Last Name</label>
                          <Input value="Doe" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input value="john.doe@example.com" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input value="+1 (555) 123-4567" />
                      </div>
                      
                      <Button className="bg-spatioo-green hover:bg-spatioo-green-dark text-white">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-xl border bg-background">
                    <h3 className="font-medium mb-4">Vehicles</h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Toyota Camry</h4>
                            <p className="text-sm text-muted-foreground">License: ABC-1234</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                      
                      <Button variant="outline">
                        <Car className="h-4 w-4 mr-2" />
                        Add Vehicle
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-xl border bg-background">
                    <h3 className="font-medium mb-4">Security</h3>
                    <div className="space-y-4">
                      <Button variant="outline">
                        Change Password
                      </Button>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security.</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>
                    </div>
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

export default Dashboard;
