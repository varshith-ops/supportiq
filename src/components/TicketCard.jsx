 function TicketCard({ ticket, updateStatus,updatingId }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">

      {/* Ticket ID */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-slate-800">
            {ticket.ticketId || ticket.id}
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            {ticket.category}
          </p>
        </div>

        {/* Status */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            ticket.status === "Resolved"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {ticket.status}
        </span>
      </div>

      {/* Customer Query */}
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-600">
          Customer Query
        </p>

        <p className="text-sm text-slate-700 mt-1">
          {ticket.query}
        </p>
      </div>

      {/* Intent */}
      <div className="mt-3">
        <p className="text-sm font-medium text-slate-600">
          Intent
        </p>

        <p className="text-sm text-slate-700 mt-1">
          {ticket.intent}
        </p>
      </div>

      {/* Priority + Sentiment */}
      <div className="flex gap-3 mt-4">

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            ticket.priority === "Critical"
              ? "bg-red-100 text-red-700"
              : ticket.priority === "High"
              ? "bg-orange-100 text-orange-700"
              : ticket.priority === "Medium"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          Priority: {ticket.priority}
        </span>

        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {ticket.sentiment}
        </span>

      </div>

      {/* Mark as Resolved Button */}
      {ticket.status === "Pending" && (
        <div className="mt-5">
          <button
            onClick={() => updateStatus(ticket._id)}
            disabled={updatingId === ticket._id}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            {updatingId === ticket._id
      ? "Updating..."
      : "Mark as Resolved"} 
          </button>
        </div>
      )}

    </div>
  );
}

export default TicketCard;