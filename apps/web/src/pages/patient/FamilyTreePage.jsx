import React, { useCallback, useState, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PublicLayout from '../../layout/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchFamilyMembers, fetchFamilyTree, fetchHouseholdBySubmittedBy, fetchChronicDiseasesByMember, updateFamilyMember, updateMemberProfile } from '../../api/patientApi';

const FamilyMemberNode = ({ data, selected }) => {
  const isMale = data.gender?.toLowerCase() === 'male';
  const displayDiseases = data.diseases?.slice(0, 2) || [];
  const extraCount = (data.diseases?.length || 0) - 2;

  return (
    <div className={`
        w-[280px] h-[110px] p-4 rounded-2xl transition-all duration-300 relative
        border flex items-center
        ${isMale ? 'bg-blue-100/90 border-blue-300/60 shadow-[4px_4px_0px_rgba(59,130,246,0.1)]' : 'bg-pink-100/90 border-pink-300/60 shadow-[4px_4px_0px_rgba(236,72,153,0.1)]'}
        ${data.isUser ? 'ring-2 ring-teal-500 border-teal-500 bg-white scale-[1.02]' : 'hover:border-slate-400 hover:translate-y-[-2px] hover:shadow-xl'}
        ${selected ? 'ring-2 ring-slate-800 border-slate-800' : ''}
    `}>
        {/* Handles */}
        <Handle type="target" position={Position.Top} className="!opacity-0 !pointer-events-none" />
        <Handle type="source" position={Position.Bottom} className="!opacity-0 !pointer-events-none" id="bottom" />
        <Handle type="source" position={Position.Left} id="l" style={{ top: '55px' }} className="!opacity-0 !pointer-events-none" />
        <Handle type="source" position={Position.Right} id="r" style={{ top: '55px' }} className="!opacity-0 !pointer-events-none" />

        {/* Action Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); data.onAddDisease(data.label); }}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-xl bg-teal-600 text-white shadow-lg flex items-center justify-center hover:bg-teal-700 active:scale-90 transition-all z-20 border-2 border-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="flex items-center gap-4 w-full h-full">
            {/* User Icon */}
            <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 ${
                isMale ? 'bg-blue-600/10 border-blue-200 text-blue-600' : 'bg-pink-600/10 border-pink-200 text-pink-600'
            }`}>
                {isMale ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z m0-2v2m-2-1h4" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14c-3.866 0-7 3.134-7 7h14c0-3.866-3.134-7-7-7z" />
                    </svg>
                )}
            </div>

            {/* Member Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-extrabold text-slate-800 text-[13px] truncate uppercase tracking-tight">{data.label}</span>
                    {data.isUser && (
                        <span className="px-1.5 py-0.5 bg-teal-500 text-white text-[8px] font-black rounded-md uppercase shadow-sm shrink-0">ME</span>
                    )}
                </div>

                <div className="h-px bg-slate-200/50 w-full mb-1.5" />

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Health Profile</span>
                        {extraCount > 0 && (
                            <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-1.5 rounded-full">+ {extraCount} More</span>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                        {displayDiseases.length > 0 ? (
                            displayDiseases.map((d, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-white text-rose-600 text-[8px] font-bold rounded-md border border-rose-200 shadow-[2px_2px_0px_rgba(225,29,72,0.05)] truncate max-w-[85px]">
                                    {d}
                                </span>
                            ))
                        ) : (
                            <span className="text-[9px] text-slate-400 font-medium italic">Clear history</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const JunctionNode = () => (
    <div className="w-1 h-1 opacity-0 pointer-events-none">
        <Handle type="target" position={Position.Top} className="!opacity-0" />
        <Handle type="source" position={Position.Bottom} id="bottom" className="!opacity-0" />
        <Handle type="target" position={Position.Left} id="l" className="!opacity-0" />
        <Handle type="target" position={Position.Right} id="r" className="!opacity-0" />
    </div>
);

const nodeTypes = { 
    familyMember: FamilyMemberNode,
    junction: JunctionNode
};

function FamilyTreePage() {
  const { user } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [targetMemberName, setTargetMemberName] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  
  const loadRealFamilyTree = useCallback(async () => {
    try {
        setLoading(true);
        let currentHouseholdId = user?.household_id;

        if (!user) {
            setLoading(false);
            return;
        }

        if (!currentHouseholdId) {
            const currentUserId = user?.systemId || user?.member_id || user?.employeeId;
            const houseRes = await fetchHouseholdBySubmittedBy(currentUserId || 'me');
            if (houseRes.success && houseRes.data) {
                currentHouseholdId = houseRes.data.household_id;
            }
        }

        if (!currentHouseholdId) {
            setLoading(false);
            return;
        }

        // Step 1: Find this user's household and members
        const currentUserId = user?.systemId || user?.member_id || user?.employeeId;
        const houseRes = await fetchHouseholdBySubmittedBy(currentUserId || 'me');
        
        const membersRes = await fetchFamilyMembers(`?household_id=${currentHouseholdId}`);
        if (!membersRes.success || !membersRes.data.familyMembers.length) {
            setLoading(false);
            return;
        }

        const familyMembers = membersRes.data.familyMembers;
        const householdData = houseRes.success ? houseRes.data : null;
        
        // Find the Primary Resident (Head) explicitly
        // Priority 1: m.isHead property
        // Priority 2: Match against householdData.head_member_name
        // Priority 3: Fallback to the first member
        const primaryResident = familyMembers.find(m => m.isHead) || 
                              familyMembers.find(m => m.full_name === householdData?.head_member_name) ||
                              familyMembers[0];
        
        if (!primaryResident) {
            setLoading(false);
            return;
        }

        // Step 2: Fetch the tree structure for the Primary Resident
        const treeRes = await fetchFamilyTree(primaryResident.family_member_id);
        if (!treeRes.success) {
            setLoading(false);
            return;
        }

        const { member: rootMember, relationships } = treeRes.data;
        let newNodes = [];
        let newEdges = [];

        // Add Root Node (Primary Resident)
        const rootId = `node-${rootMember.family_member_id}`;
        
        // Helper to get diseases from current backend field
        const getDiseases = (m) => m.diseases || [];

        const headDiseases = getDiseases(rootMember);

        const headNodeId = rootId;
        const headNode = {
            id: headNodeId,
            type: 'familyMember',
            position: { x: 400, y: 150 }, // Primary row
            data: { 
                label: rootMember.full_name, 
                gender: rootMember.gender,
                isUser: rootMember.full_name === user.full_name,
                diseases: headDiseases,
                id: rootMember._id || rootMember.family_member_id,
                linked_system_id: rootMember.linked_system_id,
                isMemberCollection: !!rootMember.linked_system_id, 
                onAddDisease: (name) => setTargetMemberName(name)
            },
            draggable: false
        };
        newNodes.push(headNode);

        // Filter spouses and children
        const spouses = relationships.filter(rel => 
            rel.relationship?.toLowerCase().includes('wife') || 
            rel.relationship?.toLowerCase().includes('husband') || 
            rel.relationship?.toLowerCase().includes('spouse')
        );

        const others = relationships.filter(rel => !spouses.find(s => s.id === rel.id));

        // Spousal Logic
        if (spouses.length > 0) {
            const spouse = spouses[0];
            const spouseId = `node-${spouse.relatedMember.family_member_id}`;
            const junctionId = `junction-${headNodeId}-spouse`;
            const spouseDiseases = getDiseases(spouse.relatedMember);

            // Position Spouse horizontally next to head
            newNodes.push({
                id: spouseId,
                type: 'familyMember',
                position: { x: 750, y: 150 }, 
                data: { 
                    label: spouse.relatedMember.full_name, 
                    gender: spouse.relatedMember.gender,
                    isUser: spouse.relatedMember.full_name === user.full_name,
                    diseases: spouseDiseases,
                    id: spouse.relatedMember._id || spouse.relatedMember.family_member_id,
                    linked_system_id: spouse.relatedMember.linked_system_id,
                    isMemberCollection: !!spouse.relatedMember.linked_system_id,
                    onAddDisease: (name) => setTargetMemberName(name)
                },
                draggable: false
            });

            // FIXED GEOMETRY: 
            // Card width: 280, Card height: 110.
            // Head x=400, Spouse x=750.
            // Junction x: (Head_X + Card_Width + Spouse_X) / 2
            // x: (400 + 280 + 750) / 2 = 1430 / 2 = 715.
            // y: 150 + (110 / 2) = 205 (Horizontal midline of cards)
            newNodes.push({
                id: junctionId,
                type: 'junction',
                position: { x: 715, y: 205 }, 
                draggable: false,
                data: {}
            });

            // Coupling line (Straight from sides)
            newEdges.push({
                id: `e-couple-${headNodeId}`,
                source: headNodeId,
                target: junctionId,
                sourceHandle: 'r',
                targetHandle: 'l',
                type: 'straight',
                style: { stroke: '#94a3b8', strokeWidth: 3 },
            });
            newEdges.push({
                id: `e-couple-${spouseId}`,
                source: spouseId,
                target: junctionId,
                sourceHandle: 'l',
                targetHandle: 'r',
                type: 'straight',
                style: { stroke: '#94a3b8', strokeWidth: 3 },
            });

            // Children - Balanced Grid relative to junction
            const cardWidth = 280;
            const cardGap = 80;
            const totalChildrenWidth = (others.length * cardWidth) + ((others.length - 1) * cardGap);
            const childrenStartPadding = 715 - (totalChildrenWidth / 2);

            for (const [index, rel] of others.entries()) {
                const childId = `node-${rel.relatedMember.family_member_id}`;
                const childDiseases = getDiseases(rel.relatedMember);
                
                newNodes.push({
                    id: childId,
                    type: 'familyMember',
                    position: { 
                        x: childrenStartPadding + (index * (cardWidth + cardGap)), 
                        y: 450 
                    },
                    data: { 
                        label: rel.relatedMember.full_name, 
                        gender: rel.relatedMember.gender,
                        isUser: rel.relatedMember.full_name === user.full_name,
                        diseases: childDiseases,
                        id: rel.relatedMember._id || rel.relatedMember.family_member_id,
                        linked_system_id: rel.relatedMember.linked_system_id,
                        isMemberCollection: !!rel.relatedMember.linked_system_id,
                        onAddDisease: (name) => setTargetMemberName(name)
                    },
                    draggable: false
                });

                newEdges.push({
                    id: `e-child-${childId}`,
                    source: junctionId,
                    target: childId,
                    sourceHandle: 'bottom',
                    type: 'step',
                    style: { stroke: '#64748b', strokeWidth: 3 },
                });
            }
        } else {
            // Direct drop for single parents
            const cardWidth = 280;
            const cardGap = 80;
            const parentCenterX = 400 + (cardWidth / 2);
            const totalChildrenWidth = (others.length * cardWidth) + ((others.length - 1) * cardGap);
            const childrenStartPadding = parentCenterX - (totalChildrenWidth / 2);

            for (const [index, rel] of others.entries()) {
                const childId = `node-${rel.relatedMember.family_member_id}`;
                const childDiseases = getDiseases(rel.relatedMember);
                
                newNodes.push({
                    id: childId,
                    type: 'familyMember',
                    position: { 
                        x: childrenStartPadding + (index * (cardWidth + cardGap)), 
                        y: 450 
                    },
                    data: { 
                        label: rel.relatedMember.full_name, 
                        gender: rel.relatedMember.gender,
                        isUser: rel.relatedMember.full_name === user.full_name,
                        diseases: childDiseases,
                        id: rel.relatedMember._id || rel.relatedMember.family_member_id,
                        linked_system_id: rel.relatedMember.linked_system_id,
                        isMemberCollection: !!rel.relatedMember.linked_system_id,
                        onAddDisease: (name) => setTargetMemberName(name)
                    },
                    draggable: false
                });

                newEdges.push({
                    id: `e-direct-${childId}`,
                    source: headNodeId,
                    target: childId,
                    type: 'step',
                    style: { stroke: '#64748b', strokeWidth: 3 },
                });
            }
        }

        setNodes(newNodes);
        setEdges(newEdges);
    } catch (err) {
        console.error("Failed to load family tree", err);
    } finally {
        setLoading(false);
    }
  }, [user, setNodes, setEdges]);

  useEffect(() => {
    loadRealFamilyTree();
  }, [loadRealFamilyTree]);

  const toggleDiseaseOnNode = (disease) => {
    const targetNode = nodes.find(n => n.data.label === targetMemberName);
    if (!targetNode) return;

    const currentDiseases = targetNode.data.diseases || [];
    const isDuplicate = currentDiseases.includes(disease);
    const updatedDiseases = isDuplicate 
      ? currentDiseases.filter(d => d !== disease) 
      : [...currentDiseases, disease];

    setNodes(nds => nds.map(node => {
      if (node.data.label === targetMemberName) {
        return {
          ...node,
          data: {
            ...node.data,
            diseases: updatedDiseases
          }
        };
      }
      return node;
    }));
  };

  const saveToBackend = async () => {
    const targetNode = nodes.find(n => n.data.label === targetMemberName);
    if (!targetNode) return;

    const updatedDiseases = targetNode.data.diseases || [];

    try {
        const memberId = targetNode.data.id;
        const linkedSystemId = targetNode.data.linked_system_id;
        
        // If it's a primary member (directly or linked), update the Member collection
        if (linkedSystemId) {
            await updateMemberProfile(linkedSystemId, { diseases: updatedDiseases });
        } 
        
        // Always update the FamilyMember collection as well so the field in both places stays synced
        await updateFamilyMember(memberId, { diseases: updatedDiseases });
        
        setTargetMemberName(null);
    } catch (err) {
        console.error("Failed to save disease update", err);
    }
  };

  return (
    <PublicLayout>
      <div className="h-[calc(100vh-80px)] flex flex-col max-w-[1800px] mx-auto bg-slate-50/30">
        {/* Simplified Header */}
        <div className="flex justify-between items-center mb-6 px-4">
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Family Tree</h1>
              <p className="text-slate-400 text-[15px] font-bold mt-0.5 ">
                {loading ? 'Synchronizing Data...' : `Resident: ${user?.full_name || 'Anonymous'}`}
              </p>
            </div>

            {/* Instructions Bar pushed to the right */}
            <div className="hidden md:flex items-center gap-5 bg-teal-600 backdrop-blur-md px-5 py-2 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-[0_0_8px_rgba(20,184,166,0.3)]" />
                    <span className="text-[12px] font-bold text-white whitespace-nowrap tracking-wide">Scroll to Zoom</span>
                </div>
                <div className="w-px h-3 bg-slate-200" />
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60  shadow-[0_0_8px_rgba(20,184,166,0.3)]" />
                    <span className="text-[12px] font-bold text-white whitespace-nowrap tracking-wide">Drag to Navigate</span>
                </div>
                <div className="w-px h-3 bg-slate-200" />
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60  shadow-[0_0_8px_rgba(20,184,166,0.3)]" />
                    <span className="text-[12px] font-bold text-white whitespace-nowrap tracking-wide">Click (+) to add Disease when Unlocked</span>
                </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative group">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-bold animate-pulse">Synchronizing Family Records...</p>
                </div>
            </div>
          ) : nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="text-5xl mb-4">🌳</div>
                    <h3 className="text-xl font-bold text-slate-800">No Family Records Found</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-2">Please ensure your household registration and family relationships are completed.</p>
                </div>
            </div>
          ) : null}
          
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            connectionMode="loose"
            maxZoom={1.5}
            minZoom={0.2}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnDrag={!isLocked}
            zoomOnScroll={!isLocked}
            zoomOnPinch={!isLocked}
            zoomOnDoubleClick={!isLocked}
            preventScrolling={true}
          >
            <Background color="#cbd5e1" gap={30} size={1} variant="dots" />
            <Controls 
              className="!bg-white/80 backdrop-blur-md !border-none !shadow-2xl !rounded-full p-2" 
              onInteractiveChange={(interactive) => setIsLocked(!interactive)}
            />
          </ReactFlow>
        </div>

        {targetMemberName && (
          <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 transition-all animate-in fade-in duration-300" onClick={() => setTargetMemberName(null)}>
            <div className="bg-white rounded-[10px] w-full max-w-4xl p-0 shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 delay-75 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              {/* Header with improved styling */}
              <div className="bg-white px-8 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm border border-teal-100/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 leading-tight">Medical History</h2>
                    <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{targetMemberName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setTargetMemberName(null)} 
                  className="w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg flex items-center justify-center transition-all group active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="px-8 py-6">
                  {/* Category 1 */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="w-1 h-4 bg-rose-500 rounded-full" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                      Chronic & Family-Linked
                    </h3>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                      'Diabetes (Type 2)', 'Hypertension', 'Heart Disease', 'Stroke', 
                      'Asthma', 'Kidney Disease', 'CKDu (Sri Lanka)', 'Cancer (Any Type)', 
                      'Mental Health (Depression/Anxiety)'
                    ].map(disease => {
                      const isSelected = nodes.find(n => n.data.label === targetMemberName)?.data.diseases?.includes(disease);
                      return (
                        <button
                          key={disease}
                          onClick={() => toggleDiseaseOnNode(disease)}
                          className={`group relative p-3 rounded-2xl border-2 text-left transition-all duration-200 ${
                            isSelected
                            ? 'bg-rose-50/50 border-rose-500 text-rose-700 shadow-sm scale-[1.01]'
                            : 'bg-white border-slate-100 text-slate-600 hover:border-rose-500 hover:bg-rose-50/20 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between pointer-events-none gap-2">
                            <span className="font-bold text-[11.5px] tracking-tight leading-tight">{disease}</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                              isSelected 
                              ? 'bg-rose-500 border-rose-500 text-white' 
                              : 'border-slate-200 group-hover:border-rose-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Category 2 */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="w-1 h-4 bg-purple-500 rounded-full" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                      Genetic Disorders (Sri Lanka)
                    </h3>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                      'Thalassemia (Alpha/Beta)', 'Sickle Cell Disease', 'Inherited Platelet Disorder', 
                      'Homocystinuria', 'Cystic Fibrosis', 'Spinocerebellar Ataxia', 
                      'Epilepsy (Genetic)', 'Autism Spectrum Disorder', 'Skeletal Dysplasia', 
                      'Congenital Deformity', 'Inherited Breast Cancer (BRCA)', 
                      'Familial Colorectal Cancer', 'Familial Hypercholesterolemia'
                    ].map(disease => {
                      const isSelected = nodes.find(n => n.data.label === targetMemberName)?.data.diseases?.includes(disease);
                      return (
                        <button
                          key={disease}
                          onClick={() => toggleDiseaseOnNode(disease)}
                          className={`group relative p-3 rounded-2xl border-2 text-left transition-all duration-200 ${
                            isSelected
                            ? 'bg-purple-50/50 border-purple-500 text-purple-700 shadow-sm scale-[1.01]'
                            : 'bg-white border-slate-100 text-slate-600 hover:border-purple-500 hover:bg-purple-50/20 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between pointer-events-none gap-2">
                            <span className="font-bold text-[11.5px] tracking-tight leading-tight">{disease}</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                              isSelected 
                              ? 'bg-purple-500 border-purple-500 text-white' 
                              : 'border-slate-200 group-hover:border-purple-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Category 3 */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                      Global Genetic & Chromosomal
                    </h3>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-2">
                    {[
                      'Down Syndrome', 'Turner Syndrome', 'Klinefelter Syndrome', 
                      'Hemophilia', 'Muscular Dystrophy', 'Huntington’s Disease', 
                      'Tay-Sachs Disease', 'Congenital Hypothyroidism', 'Diabetes (Type 1 Genetic Link)'
                    ].map(disease => {
                      const isSelected = nodes.find(n => n.data.label === targetMemberName)?.data.diseases?.includes(disease);
                      return (
                        <button
                          key={disease}
                          onClick={() => toggleDiseaseOnNode(disease)}
                          className={`group relative p-3 rounded-2xl border-2 text-left transition-all duration-200 ${
                            isSelected
                            ? 'bg-blue-50/50 border-blue-500 text-blue-700 shadow-sm scale-[1.01]'
                            : 'bg-white border-slate-100 text-slate-600 hover:border-blue-500 hover:bg-blue-50/20 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between pointer-events-none gap-2">
                            <span className="font-bold text-[11.5px] tracking-tight leading-tight">{disease}</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                              isSelected 
                              ? 'bg-blue-500 border-blue-500 text-white' 
                              : 'border-slate-200 group-hover:border-blue-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="px-8 py-4 bg-slate-50/80 border-t border-slate-100 shrink-0 flex justify-end">
                <button 
                  onClick={saveToBackend}
                  className="w-full sm:w-56 bg-teal-700 text-white font-bold py-3.5 rounded-xl hover:bg-teal-800 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em]"
                >
                  Confirm Record
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

export default FamilyTreePage;
