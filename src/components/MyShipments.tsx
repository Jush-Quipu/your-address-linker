
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Package, TruckIcon, Search, RefreshCcw, ExternalLink, CheckCircle } from 'lucide-react';
import { Shipment, trackShipment, confirmDelivery } from '@/services/shipmentService';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShipmentStatusProps {
  status: string;
}

const ShipmentStatus: React.FC<ShipmentStatusProps> = ({ status }) => {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  
  switch (status) {
    case 'created':
    case 'label_created':
      variant = 'secondary';
      break;
    case 'in_transit':
    case 'out_for_delivery':
      variant = 'default';
      break;
    case 'delivered':
      variant = 'outline';
      break;
    case 'failed':
    case 'exception':
      variant = 'destructive';
      break;
    default:
      variant = 'secondary';
  }
  
  return (
    <Badge variant={variant}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
};

interface TimelineEventProps {
  status: string;
  location: string;
  timestamp: string;
  isLatest?: boolean;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({ status, location, timestamp, isLatest = false }) => {
  return (
    <div className="flex mb-4">
      <div className="relative mr-3">
        <div className={`w-3 h-3 rounded-full mt-1.5 ${isLatest ? 'bg-primary' : 'bg-gray-300'}`}></div>
        {!isLatest && <div className="absolute w-0.5 bg-gray-300 h-full left-1.5 top-3"></div>}
      </div>
      <div className="flex-1">
        <div className="flex flex-col">
          <span className={`font-medium ${isLatest ? 'text-primary' : 'text-gray-700'}`}>
            {status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1)}
          </span>
          <span className="text-sm text-muted-foreground">{location}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

interface ShipmentDetailsProps {
  shipment: Shipment;
  onClose: () => void;
  onRefresh: () => void;
}

const ShipmentDetails: React.FC<ShipmentDetailsProps> = ({ shipment, onClose, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const isMobile = useIsMobile();
  
  const trackingHistory = shipment.tracking_details?.trackingHistory || [];
  const needsConfirmation = shipment.confirmation_required && shipment.status === 'delivered' && shipment.confirmation_status !== 'confirmed';
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await trackShipment(shipment.id);
      toast.success('Tracking information updated');
      onRefresh();
    } catch (error) {
      toast.error('Failed to update tracking', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await confirmDelivery(shipment.id);
      toast.success('Delivery confirmed');
      onRefresh();
    } catch (error) {
      toast.error('Failed to confirm delivery', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setConfirming(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Shipment Info</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Carrier:</dt>
                <dd className="font-medium">{shipment.carrier.toUpperCase()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Service:</dt>
                <dd className="font-medium">{shipment.service}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tracking #:</dt>
                <dd className="font-medium">{shipment.tracking_number || 'Pending'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created:</dt>
                <dd className="font-medium">{new Date(shipment.created_at).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status:</dt>
                <dd><ShipmentStatus status={shipment.status} /></dd>
              </div>
              {shipment.tracking_details?.estimatedDelivery && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Est. Delivery:</dt>
                  <dd className="font-medium">
                    {new Date(shipment.tracking_details.estimatedDelivery).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            {shipment.carrier_details?.labelUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => window.open(shipment.carrier_details.labelUrl, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Label
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Tracking History</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto">
            {trackingHistory.length > 0 ? (
              <div className="space-y-1">
                {[...trackingHistory].reverse().map((event, index) => (
                  <TimelineEvent
                    key={index}
                    status={event.status}
                    location={event.location}
                    timestamp={event.timestamp}
                    isLatest={index === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No tracking updates available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {needsConfirmation && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CheckCircle className="mr-2 h-5 w-5 text-primary" />
              Delivery Confirmation Required
            </CardTitle>
            <CardDescription>
              Please confirm that you have received this package
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleConfirm}
              disabled={confirming}
            >
              {confirming ? 'Confirming...' : 'Confirm Delivery'}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

interface ShipmentListProps {
  shipments: Shipment[];
  onSelectShipment: (shipment: Shipment) => void;
}

const ShipmentList: React.FC<ShipmentListProps> = ({ shipments, onSelectShipment }) => {
  const isMobile = useIsMobile();
  
  if (shipments.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No shipments found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          When you create shipments, they will appear here.
        </p>
      </div>
    );
  }
  
  if (isMobile) {
    return (
      <div className="space-y-4">
        {shipments.map((shipment) => (
          <Card key={shipment.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => onSelectShipment(shipment)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <TruckIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <CardTitle className="text-base">{shipment.carrier.toUpperCase()}</CardTitle>
                </div>
                <ShipmentStatus status={shipment.status} />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracking:</span>
                  <span className="font-mono">{shipment.tracking_number || 'Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span>{shipment.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{new Date(shipment.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Carrier</TableHead>
          <TableHead>Tracking #</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shipments.map((shipment) => (
          <TableRow key={shipment.id}>
            <TableCell className="font-medium">{shipment.carrier.toUpperCase()}</TableCell>
            <TableCell className="font-mono">{shipment.tracking_number || 'Pending'}</TableCell>
            <TableCell>{shipment.service}</TableCell>
            <TableCell>{new Date(shipment.created_at).toLocaleDateString()}</TableCell>
            <TableCell><ShipmentStatus status={shipment.status} /></TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => onSelectShipment(shipment)}>
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

interface MyShipmentsProps {
  shipments: Shipment[];
  isLoading?: boolean;
  onRefresh: () => void;
}

const MyShipments: React.FC<MyShipmentsProps> = ({ 
  shipments, 
  isLoading = false,
  onRefresh
}) => {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredShipments = shipments.filter(shipment => {
    // Apply search query filter
    const matchesSearch = 
      !searchQuery || 
      shipment.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.service.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const activeShipments = shipments.filter(s => 
    s.status !== 'delivered' && s.status !== 'exception' && s.status !== 'failed'
  );
  
  const deliveredShipments = shipments.filter(s => s.status === 'delivered');
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              My Shipments
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search shipments..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="active">
                Active ({activeShipments.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({shipments.length})
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Delivered ({deliveredShipments.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <ShipmentList 
                shipments={activeShipments} 
                onSelectShipment={setSelectedShipment} 
              />
            </TabsContent>
            
            <TabsContent value="all">
              <ShipmentList 
                shipments={filteredShipments} 
                onSelectShipment={setSelectedShipment} 
              />
            </TabsContent>
            
            <TabsContent value="delivered">
              <ShipmentList 
                shipments={deliveredShipments} 
                onSelectShipment={setSelectedShipment} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedShipment} onOpenChange={(open) => !open && setSelectedShipment(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
            <DialogDescription>
              Tracking information for shipment {selectedShipment?.tracking_number || 'Pending'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedShipment && (
            <ShipmentDetails 
              shipment={selectedShipment} 
              onClose={() => setSelectedShipment(null)}
              onRefresh={() => {
                onRefresh();
                setSelectedShipment(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyShipments;
