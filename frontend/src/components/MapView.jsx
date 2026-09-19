import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
function MapView({ incidents }) {
    const center = [22.3072, 73.1812]; // default center, e.g. Vadodara

    return (
        <MapContainer center={center} zoom={12} style={{ height: "500px", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            {incidents.map((incident) => (
                <Marker key={incident.id} position={[incident.lat, incident.lng]}>
                    <Popup>
                        <strong>{incident.type}</strong><br />
                        Severity: {incident.severity}<br />
                        Status: {incident.status}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export default MapView;