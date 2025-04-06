import { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, { MiniMap, Controls, Background, addEdge, useNodesState, useEdgesState, Panel } from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const nodeStyles = {
  leadSource: { background: "#e6ffe6", border: "1px solid #2ecc71", borderRadius: "8px", padding: "10px" },
  coldEmail: { background: "#d4edff", border: "1px solid #3498db", borderRadius: "8px", padding: "10px" },
  task: { background: "#fff3e6", border: "1px solid #e67e22", borderRadius: "8px", padding: "10px" },
  wait: { background: "#f2f2f2", border: "1px solid #7f8c8d", borderRadius: "8px", padding: "10px" },
  ifelse: { background: "#fff8e1", border: "1px solid #f1c40f", borderRadius: "8px", padding: "10px" },
  split: { background: "#f4e6ff", border: "1px solid #9b59b6", borderRadius: "8px", padding: "10px" },
};

const initialNodes = [
  { id: "1", type: "input", data: { label: "Add Lead Source", nodeType: "leadSource" }, position: { x: 250, y: 5 }, style: nodeStyles.leadSource },
  { id: "2", data: { label: "Sequence Start Point", nodeType: "start" }, position: { x: 250, y: 100 }, style: { background: "#f0f0f0", border: "1px solid #ccc", borderRadius: "8px", padding: "10px" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const ScheduleEmail = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [sequenceName, setSequenceName] = useState("New Sequence");
  const [selectedNode, setSelectedNode] = useState(null);
  const [sequenceData, setSequenceData] = useState({
    leadSource: "",
    blocks: [],
    emailData: { email: "", subject: "", body: "", templateType: "RE: Follow Up" },
    schedule: { launchDate: "", timeZone: "Asia/Kolkata", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], fromTime: "09:00", tillTime: "17:00", emailsPerDay: "24-48", randomDelays: true },
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const reactFlowWrapper = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      toast.error("Please log in to access this page");
    }
  }, [navigate]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const addNode = (type, label, sourceId = "2") => {
    const newNodeId = `${Date.now()}`;
    const nodeType = type.toLowerCase().replace(/ /g, "");
    const newNode = {
      id: newNodeId,
      position: { x: Math.random() * 300 + 50, y: nodes.length * 80 + 180 },
      data: { label, nodeType },
      style: nodeStyles[nodeType] || {}
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, { id: `e${sourceId}-${newNodeId}`, source: sourceId, target: newNodeId }]);
    toast.success(`Added ${type} node`);
    return newNodeId;
  };

  const handleLeadSourceSelect = (list) => {
    setSequenceData((prev) => ({ ...prev, leadSource: list }));
    setNodes((nds) => nds.map((node) => (node.id === "1" ? { ...node, data: { ...node.data, label: `Leads from List(s): ${list}` } } : node)));
    setShowModal(null);
    toast.success("List inserted!");
  };

  const handleAddBlock = (blockType, config = {}) => {
    let label = blockType;
    if (blockType === "Cold Email") label = `Cold Email: ${config.template || "New"}`;
    if (blockType === "Task") label = "Task: Follow-up";
    if (blockType === "Wait") label = "Wait: 1 day";
    if (blockType === "If/Else (Rules)") label = "If/Else: Rules";
    if (blockType === "Split 50/50") label = "Split 50/50";

    const nodeId = addNode(blockType, label);
    setSequenceData((prev) => ({ ...prev, blocks: [...prev.blocks, { id: nodeId, type: blockType, config }] }));
    setShowModal(null);
  };

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);

    if (node.id === "1" || node.data.nodeType === "leadSource") {
      setShowModal("leadSource");
    } else if (node.data.label.startsWith("Cold Email") || node.data.nodeType === "coldemail") {
      // Load the selected email data if available
      const emailBlock = sequenceData.blocks.find(block => block.id === node.id);
      if (emailBlock && emailBlock.config) {
        setSequenceData(prev => ({
          ...prev,
          emailData: {
            ...prev.emailData,
            ...emailBlock.config
          }
        }));
      }
      setShowModal("emailConfig");
    }
  };

  const saveFlow = () => {
    const flowData = { nodes, edges, sequenceName, sequenceData };
    localStorage.setItem("emailFlow", JSON.stringify(flowData));
    toast.success("Flow saved successfully");
  };

  const loadFlow = () => {
    try {
      const savedFlow = localStorage.getItem("emailFlow");
      if (savedFlow) {
        const parsedFlow = JSON.parse(savedFlow);
        setNodes(parsedFlow.nodes || initialNodes);
        setEdges(parsedFlow.edges || initialEdges);
        setSequenceName(parsedFlow.sequenceName || "New Sequence");
        setSequenceData(parsedFlow.sequenceData || {
          leadSource: "",
          blocks: [],
          emailData: { email: "", subject: "", body: "", templateType: "RE: Follow Up" },
          schedule: { launchDate: "", timeZone: "Asia/Kolkata", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], fromTime: "09:00", tillTime: "17:00", emailsPerDay: "24-48", randomDelays: true },
        });
        toast.success("Flow loaded successfully");
      } else {
        toast.error("No saved flow found");
      }
    } catch (error) {
      console.error("Error loading flow:", error);
      toast.error("Failed to load flow data");
    }
  };

  const clearFlow = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSequenceName("New Sequence");
    setSequenceData({
      leadSource: "",
      blocks: [],
      emailData: { email: "", subject: "", body: "", templateType: "RE: Follow Up" },
      schedule: {
        launchDate: "",
        timeZone: "Asia/Kolkata",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        fromTime: "09:00",
        tillTime: "17:00",
        emailsPerDay: "24-48",
        randomDelays: true
      }
    });
    setSelectedNode(null);
    toast.success("Flow cleared");
  };

  const updateEmailConfig = () => {
    if (selectedNode && selectedNode.id) {
      // Update the node label
      setNodes(nodes.map(node => {
        if (node.id === selectedNode.id) {
          const template = sequenceData.emailData.template || "Template";
          return {
            ...node,
            data: {
              ...node.data,
              label: `Cold Email: ${template}`
            }
          };
        }
        return node;
      }));

      // Update the block in sequenceData
      setSequenceData(prev => ({
        ...prev,
        blocks: prev.blocks.map(block => {
          if (block.id === selectedNode.id) {
            return {
              ...block,
              config: sequenceData.emailData
            };
          }
          return block;
        })
      }));

      toast.success("Email template updated!");
    } else {
      // Add as new block if no node is selected
      handleAddBlock("Cold Email", sequenceData.emailData);
    }
    setShowModal(null);
  };

  const handleSubmit = async (paused = false) => {
    const { emailData, schedule } = sequenceData;
    if (!sequenceData.leadSource) return toast.error("Please select a lead source");
    if (!emailData.email) return toast.error("Recipient email is required");
    if (!emailData.subject) return toast.error("Email subject is required");
    if (!emailData.body) return toast.error("Email body is required");
    if (!schedule.launchDate) return toast.error("Launch date is required");
  
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You need to be logged in to schedule emails");
        navigate("/login");
        return;
      }
  
      // Calculate the next valid sending time based on schedule settings
      const scheduledDateTime = calculateNextSendTime(schedule);
      
      // Include the calculated schedule time in the request
      const flowData = { nodes, edges, sequenceName, sequenceData };
      await axios.post(
        "https://email-marketingbackend01.vercel.app/api/emails/schedule",
        {
          ...emailData,
          flowData,
          scheduledDateTime,  // Add calculated date/time
          status: paused ? "paused" : "scheduled"
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      toast.success(paused ? "Sequence saved as paused!" : "Email scheduled successfully!");
      clearFlow();
      setShowModal(null);
    } catch (error) {
      console.error("Error scheduling email:", error);
      toast.error(error.response?.data?.message || "Error scheduling email");
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to calculate the next valid send time
  const calculateNextSendTime = (schedule) => {
    // Parse the launch date
    const launchDate = new Date(schedule.launchDate);
    
    // Set the time using fromTime
    const [hours, minutes] = schedule.fromTime.split(':').map(Number);
    launchDate.setHours(hours, minutes, 0, 0);
    
    // Get current date for comparison
    const now = new Date();
    
    // If launch date is in the past, find the next valid day
    if (launchDate < now) {
      // Find the next valid day from today
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
      // Create a map for quick lookup
      const scheduledDays = schedule.days.reduce((map, day) => {
        map[day] = true;
        return map;
      }, {});
      
      // Find the next available day
      let daysToAdd = 0;
      let foundDay = false;
      
      for (let i = 0; i < 7; i++) {
        const checkDay = (currentDay + i) % 7;
        if (scheduledDays[dayNames[checkDay]]) {
          daysToAdd = i;
          foundDay = true;
          break;
        }
      }
      
      if (!foundDay) {
        // No valid days found, use tomorrow as fallback
        daysToAdd = 1;
      }
      
      // Set to the next valid day
      const nextDay = new Date();
      nextDay.setDate(now.getDate() + daysToAdd);
      nextDay.setHours(hours, minutes, 0, 0);
      
      return nextDay.toISOString();
    }
    
    return launchDate.toISOString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <Toaster position="top-right" />
      <header className="bg-white shadow-lg rounded-b-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{sequenceName}</h1>
            <button
              onClick={() => {
                const newName = prompt("Enter new sequence name", sequenceName);
                if (newName) setSequenceName(newName);
              }}
              className="text-gray-600 hover:text-gray-800 transition"
              aria-label="Edit sequence name"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" /></svg>
            </button>
          </div>
          <button
            onClick={() => setShowModal("schedule")}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-green-700 transition shadow-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 8zM7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708l2-2z" /></svg>
            Save & Schedule
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={saveFlow}
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition flex items-center gap-2 shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z" /></svg>Save
              </button>
              <button
                onClick={loadFlow}
                className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition flex items-center gap-2 shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" /><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" /></svg>Load
              </button>
              <button
                onClick={clearFlow}
                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition flex items-center gap-2 shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" /><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" /></svg>Clear
              </button>
            </div>
            <button
              onClick={() => setShowModal("blockType")}
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition shadow"
            >
              + Add Block
            </button>
          </div>
          <div ref={reactFlowWrapper} className="h-[600px] w-full border rounded-xl bg-gray-50 shadow-inner overflow-hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              deleteKeyCode="Delete"
              onNodeClick={handleNodeClick}
              proOptions={{ hideAttribution: true }}
            >
              <Panel position="top-right">
                <div className="bg-white p-2 rounded shadow-md text-xs text-gray-600">
                  Drag to connect • Click to edit • Press Delete to remove
                </div>
              </Panel>
              <MiniMap />
              <Controls />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </div>
        </div>

        {/* Modals */}
        {showModal === "leadSource" && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-96 transform transition-all scale-100 hover:scale-105">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Add Lead Source</h3>
              <p className="text-sm text-gray-600 mb-4">Select a source to auto-add matching leads</p>
              <button onClick={() => setShowModal("leadSourceLists")} className="block w-full text-left p-3 hover:bg-gray-100 rounded-lg transition">Leads from List(s)</button>
              <button onClick={() => console.log("Segment by Events")} className="block w-full text-left p-3 hover:bg-gray-100 rounded-lg transition">Segment by Events</button>
              <button onClick={() => console.log("Segment of List")} className="block w-full text-left p-3 hover:bg-gray-100 rounded-lg transition">Segment of List</button>
              <button onClick={() => console.log("Lead from CRM Integration")} className="block w-full text-left p-3 hover:bg-gray-100 rounded-lg transition">Lead from CRM Integration</button>
              <button onClick={() => setShowModal(null)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition w-full">Close</button>
            </div>
          </div>
        )}

        {showModal === "leadSourceLists" && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-96 transform transition-all scale-100 hover:scale-105">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Select List</h3>
              <div className="max-h-60 overflow-y-auto">
                {["SalesBlink LTD Dec 2024", "SalesBlink LTD", "[GWA] Email Verification", "Demo List", "[Shopify] Trust Badges", "[Shopify] Announcement Bar"].map((list) => (
                  <button
                    key={list}
                    onClick={() => handleLeadSourceSelect(list)}
                    className="block w-full text-left p-3 hover:bg-gray-100 rounded-lg transition"
                  >
                    {list}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowModal("leadSource")} className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition flex-1">Back</button>
                <button onClick={() => handleLeadSourceSelect("SalesBlink LTD Dec 2024")} className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition flex-1">Insert</button>
              </div>
            </div>
          </div>
        )}

        {showModal === "blockType" && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-96 transform transition-all scale-100 hover:scale-105">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Add New Block</h3>
              <div className="mb-2 font-semibold text-gray-700">Outreach</div>
              <button onClick={() => setShowModal("emailConfig")} className="block w-full text-left p-3 hover:bg-gray-100 rounded-lg transition">Cold Email</button>
              <button onClick={() => handleAddBlock("Task")} className="block w-full text-left p-3 hover:bg-gray-100 rounded-lg transition">Task</button>
              <div className="mb-2 mt-4 font-semibold text-gray-700">Conditions</div>
              <button onClick={() => handleAddBlock("Wait")} className="block w-full text-left p-3 hover:bg-gray-100 rounded-lg transition">Wait</button>
              <button onClick={() => handleAddBlock("If/Else (Rules)")} className="block w-full text-left p-3 hover:bg-gray-100 rounded-lg transition">If/Else (Rules)</button>
              <div className="mb-2 mt-4 font-semibold text-gray-700">Actions</div>
              <button onClick={() => handleAddBlock("Split 50/50")} className="block w-full text-left p-3 hover:bg-gray-100 rounded-lg transition">Split 50/50</button>
              <button onClick={() => setShowModal(null)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition w-full">Close</button>
            </div>
          </div>
        )}


        {showModal === "emailConfig" && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-[400px] max-w-full transform transition-all scale-100 hover:scale-105 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {selectedNode && selectedNode.data.label.startsWith("Cold Email") ? "Edit Email Template" : "Configure Cold Email"}
              </h3>
              <label className="block text-sm font-medium mb-2 text-gray-700">Email Template</label>
              <select
                value={sequenceData.emailData.template || ""}
                onChange={(e) => setSequenceData(prev => ({
                  ...prev,
                  emailData: { ...prev.emailData, template: e.target.value }
                }))}
                className="border p-2 w-full rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a template</option>
                <option value="SalesBlink LTD SignUp">SalesBlink LTD SignUp</option>
                <option value="[GWA] Email Verification">[GWA] Email Verification</option>
                <option value="[Shopify] Announcement Bar - 3">[Shopify] Announcement Bar - 3</option>
                <option value="[Shopify] Announcement Bar - 2">[Shopify] Announcement Bar - 2</option>
                <option value="[Shopify] Announcement Bar - 1">[Shopify] Announcement Bar - 1</option>
              </select>

              <div className="mb-4 border-t pt-3 border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">Recipients</h4>

                <label className="block text-sm font-medium mb-2 text-gray-700">Primary Recipient</label>
                <input
                  type="email"
                  value={sequenceData.emailData.email || ""}
                  onChange={(e) => setSequenceData((prev) => ({
                    ...prev,
                    emailData: { ...prev.emailData, email: e.target.value }
                  }))}
                  className="border p-2 w-full rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                  placeholder="primary@example.com"
                />

                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium mb-2 text-gray-700">CC Recipients</label>
                  <button
                    onClick={() => setSequenceData(prev => ({
                      ...prev,
                      emailData: {
                        ...prev.emailData,
                        cc: [...(prev.emailData.cc || []), '']
                      }
                    }))}
                    className="text-xs text-blue-600 hover:text-blue-800"
                    type="button"
                  >
                    + Add CC
                  </button>
                </div>

                {(sequenceData.emailData.cc || []).map((email, index) => (
                  <div key={`cc-${index}`} className="flex mb-2 items-center">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const newCc = [...(sequenceData.emailData.cc || [])];
                        newCc[index] = e.target.value;
                        setSequenceData(prev => ({
                          ...prev,
                          emailData: { ...prev.emailData, cc: newCc }
                        }));
                      }}
                      className="border p-2 flex-grow rounded-l-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="cc@example.com"
                    />
                    <button
                      onClick={() => {
                        const newCc = [...(sequenceData.emailData.cc || [])];
                        newCc.splice(index, 1);
                        setSequenceData(prev => ({
                          ...prev,
                          emailData: { ...prev.emailData, cc: newCc }
                        }));
                      }}
                      className="bg-red-100 text-red-600 px-2 py-2 rounded-r-lg hover:bg-red-200"
                      type="button"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <div className="mb-4 border-t pt-3 border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">Email Content</h4>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={sequenceData.emailData.subject || ""}
                    onChange={(e) => setSequenceData((prev) => ({
                      ...prev,
                      emailData: { ...prev.emailData, subject: e.target.value }
                    }))}
                    className="border p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Email subject"
                  />
                  <div className="mt-1 flex flex-wrap gap-1 text-xs">
                    <button
                      className="bg-blue-50 px-2 py-1 rounded text-blue-700 hover:bg-blue-100"
                      onClick={() => setSequenceData(prev => ({
                        ...prev,
                        emailData: { ...prev.emailData, subject: `${prev.emailData.subject} {{first_name}}` }
                      }))}
                    >
                      +First Name
                    </button>
                    <button
                      className="bg-blue-50 px-2 py-1 rounded text-blue-700 hover:bg-blue-100"
                      onClick={() => setSequenceData(prev => ({
                        ...prev,
                        emailData: { ...prev.emailData, subject: `RE: ${prev.emailData.subject}` }
                      }))}
                    >
                      +RE:
                    </button>
                    <button
                      className="bg-blue-50 px-2 py-1 rounded text-blue-700 hover:bg-blue-100"
                      onClick={() => setSequenceData(prev => ({
                        ...prev,
                        emailData: { ...prev.emailData, subject: `FWD: ${prev.emailData.subject}` }
                      }))}
                    >
                      +FWD:
                    </button>
                  </div>
                </div>

                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Body <span className="text-xs text-gray-500">(Supports Spintax: {"{word1|word2}"})</span>
                </label>
                <textarea
                  value={sequenceData.emailData.body || ""}
                  onChange={(e) => setSequenceData((prev) => ({
                    ...prev,
                    emailData: { ...prev.emailData, body: e.target.value }
                  }))}
                  className="border p-2 w-full rounded-lg mb-2 focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Write your email content here..."
                />

                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    className="text-blue-600 hover:underline hover:text-blue-800"
                    onClick={() => setSequenceData(prev => ({
                      ...prev,
                      emailData: {
                        ...prev.emailData,
                        body: prev.emailData.body + " {{first_name}}"
                      }
                    }))}
                  >
                    First Name
                  </button>
                  <button
                    className="text-blue-600 hover:underline hover:text-blue-800"
                    onClick={() => setSequenceData(prev => ({
                      ...prev,
                      emailData: {
                        ...prev.emailData,
                        body: prev.emailData.body + " {{company_name}}"
                      }
                    }))}
                  >
                    Company
                  </button>
                  <button
                    className="text-blue-600 hover:underline hover:text-blue-800"
                    onClick={() => console.log("Insert List Variables")}
                  >
                    List Vars
                  </button>
                  <button
                    className="text-blue-600 hover:underline hover:text-blue-800"
                    onClick={() => setSequenceData((prev) => ({
                      ...prev,
                      emailData: {
                        ...prev.emailData,
                        body: prev.emailData.body + " {{unsubscribe_link}}"
                      }
                    }))}
                  >
                    Unsubscribe
                  </button>
                  <button
                    className="text-blue-600 hover:underline hover:text-blue-800"
                    onClick={() => console.log("Insert Personalized Image")}
                  >
                    Image
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={updateEmailConfig}
                  className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition flex-1"
                  disabled={!sequenceData.emailData.subject || !sequenceData.emailData.body}
                >
                  Save
                </button>
                <button
                  onClick={() => setShowModal(null)}
                  className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}



        {showModal === "schedule" && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-96 max-w-full transform transition-all scale-100 hover:scale-105 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Schedule Settings</h3>

              <label className="block text-sm font-medium mb-2 text-gray-700">Launch on Date</label>
              <input
                type="date"
                value={sequenceData.schedule.launchDate}
                onChange={(e) => setSequenceData((prev) => ({
                  ...prev,
                  schedule: { ...prev.schedule, launchDate: e.target.value }
                }))}
                className="border p-2 w-full rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
              />

              <label className="block text-sm font-medium mb-2 text-gray-700">Time Zone</label>
              <select
                value={sequenceData.schedule.timeZone}
                onChange={(e) => setSequenceData((prev) => ({
                  ...prev,
                  schedule: { ...prev.schedule, timeZone: e.target.value }
                }))}
                className="border p-2 w-full rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
              </select>

              <label className="block text-sm font-medium mb-2 text-gray-700">Sending Days</label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <label key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      value={day}
                      checked={sequenceData.schedule.days.includes(day)}
                      onChange={(e) => {
                        const days = sequenceData.schedule.days.includes(day)
                          ? sequenceData.schedule.days.filter((d) => d !== day)
                          : [...sequenceData.schedule.days, day];
                        setSequenceData((prev) => ({
                          ...prev,
                          schedule: { ...prev.schedule, days }
                        }));
                      }}
                      className="mr-2"
                    />
                    {day}
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">From Time</label>
                  <input
                    type="time"
                    value={sequenceData.schedule.fromTime}
                    onChange={(e) => setSequenceData((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, fromTime: e.target.value }
                    }))}
                    className="border p-2 w-full rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Till Time</label>
                  <input
                    type="time"
                    value={sequenceData.schedule.tillTime}
                    onChange={(e) => setSequenceData((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, tillTime: e.target.value }
                    }))}
                    className="border p-2 w-full rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <label className="block text-sm font-medium mb-2 text-gray-700">Emails/Day/Sender</label>
              <input
                type="text"
                value={sequenceData.schedule.emailsPerDay}
                onChange={(e) => setSequenceData((prev) => ({
                  ...prev,
                  schedule: { ...prev.schedule, emailsPerDay: e.target.value }
                }))}
                className="border p-2 w-full rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 24-48"
              />

              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={sequenceData.schedule.randomDelays}
                  onChange={(e) => setSequenceData((prev) => ({
                    ...prev,
                    schedule: { ...prev.schedule, randomDelays: e.target.checked }
                  }))}
                  className="mr-2"
                />
                Add Random Delays
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSubmit(false)}
                  className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition flex-1"
                  disabled={loading}
                >
                  {loading ? "Scheduling..." : "Schedule"}
                </button>
                <button
                  onClick={() => handleSubmit(true)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition flex-1"
                  disabled={loading}
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => setShowModal(null)}
                  className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ScheduleEmail;