function IncidentCard({ incident }) {
    return (
        <div style={{
            border: "1px solid #444",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "10px",
            background: "#1e1e1e",
            color: "#fff"
        }}>
            <h3>{incident.type}</h3>
            <p>Severity: {incident.severity}</p>
            <p>Status: {incident.status}</p>
        </div>
    );
}

export default IncidentCard;