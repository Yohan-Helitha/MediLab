import React, { useCallback, useState, useMemo, useEffect } from 'react';
import {
  ReactFlow,
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
import { useTranslation } from 'react-i18next';
import { fetchFamilyMembers, fetchFamilyTree, fetchHouseholdBySubmittedBy, updateFamilyMember } from '../../api/patientApi';
import { toast } from 'react-hot-toast';
import { getSafeErrorMessage } from '../../utils/errorHandler';

const FamilyMemberNode = ({ data, selected }) => {
  const { t } = useTranslation();
  const isMale = data.gender?.toLowerCase() === 'male';
  const displayDiseases = data.diseases?.slice(0, 2) || [];
  const extraCount = (data.diseases?.length || 0) - 2;

  const nodeClassName = `
    w-[280px] h-[110px] p-4 rounded-2xl transition-all duration-300 relative
    border flex items-center
    ${isMale ? 'bg-blue-100/90 border-blue-300/60 shadow-[4px_4px_0px_rgba(59,130,246,0.1)]' : 'bg-pink-100/90 border-pink-300/60 shadow-[4px_4px_0px_rgba(236,72,153,0.1)]'}
    ${data.isUser ? 'ring-2 ring-teal-500 border-teal-500 bg-white scale-[1.02]' : 'hover:border-slate-400 hover:translate-y-[-2px] hover:shadow-xl'}
    ${selected ? 'ring-2 ring-slate-800 border-slate-800' : ''}
  `;

  return (
    <div className={nodeClassName}>
        <Handle type='target' position={Position.Top} id='top' className='!z-50' style={{ top: -4, opacity: 0, width: 10, height: 10 }} />
        <Handle type='source' position={Position.Bottom} id='bottom' className='!z-50' style={{ bottom: -4, opacity: 0, width: 10, height: 10 }} />
        <Handle type='source' position={Position.Left} id='l' className='!z-50' style={{ left: -4, top: '55px', opacity: 0, width: 10, height: 10 }} />
        <Handle type='source' position={Position.Right} id='r' className='!z-50' style={{ right: -4, top: '55px', opacity: 0, width: 10, height: 10 }} />

        <button 
          onClick={(e) => { e.stopPropagation(); data.onAddDisease(data.label); }}
          className='absolute -top-3 -right-3 w-8 h-8 rounded-xl bg-teal-600 text-white shadow-lg flex items-center justify-center hover:bg-teal-700 active:scale-90 transition-all z-20 border-2 border-white'
        >
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
            <path fillRule='evenodd' d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z' clipRule='evenodd' />
          </svg>
        </button>

        <div className='flex items-center gap-4 w-full h-full'>
            <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 ${
                isMale ? 'bg-blue-600/10 border-blue-200 text-blue-600' : 'bg-pink-600/10 border-pink-200 text-pink-600'
            }`}>
                {isMale ? (
                    <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                ) : (
                    <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14v2m-2-1h4' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M12 14c-3.866 0-7 3.134-7 7h14c0-3.866-3.134-7-7-7z' />
                    </svg>
                )}
            </div>

            <div className='flex-1 min-w-0 flex flex-col justify-center h-full'>
                <div className='flex items-center gap-2 mb-1.5'>
                    <span className='font-extrabold text-slate-800 text-[13px] truncate uppercase'>{data.label}</span>
                    {data.isUser && (
                      <span className='px-1.5 py-0.5 bg-teal-500 text-white text-[8px] font-bold rounded-md uppercase shadow-sm shrink-0'>{t('familyTree.node.me')}</span>
                    )}
                </div>

                <div className='h-px bg-slate-200/50 w-full mb-1.5' />

                <div className='space-y-1'>
                    <div className='flex items-center justify-between'>
                    <span className='text-[9px] font-bold text-slate-500 uppercase '>{t('familyTree.node.healthProfile')}</span>
                        {extraCount > 0 && (
                      <span className='text-[9px] font-bold text-teal-600 bg-teal-50 px-1.5 rounded-full'>{t('familyTree.node.more', { count: extraCount })}</span>
                        )}
                    </div>
                    
                    <div className='flex flex-wrap gap-1'>
                        {displayDiseases.length > 0 ? (
                            displayDiseases.map((d, i) => (
                                <span key={i} className='px-1.5 py-0.5 bg-white text-rose-600 text-[8px] font-bold rounded-md border border-rose-200 shadow-[2px_2px_0px_rgba(225,29,72,0.05)] truncate max-w-[85px]'>
                                    {d}
                                </span>
                            ))
                        ) : (
                          <span className='text-[9px] text-slate-400 font-medium italic'>{t('familyTree.node.clearHistory')}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const JunctionNode = () => (
    <div className='w-4 h-4 rounded-full bg-slate-400 border-2 border-white shadow-sm flex items-center justify-center -translate-x-2 -translate-y-2'>
        <div className='w-1.5 h-1.5 rounded-full bg-white' />
        <Handle type='target' position={Position.Top} id='top' style={{ opacity: 0 }} />
        <Handle type='source' position={Position.Bottom} id='bottom' style={{ opacity: 0 }} />
        <Handle type='target' position={Position.Left} id='l' style={{ opacity: 0 }} />
        <Handle type='target' position={Position.Right} id='r' style={{ opacity: 0 }} />
        <Handle type='source' position={Position.Left} id='sl' style={{ opacity: 0 }} />
        <Handle type='source' position={Position.Right} id='sr' style={{ opacity: 0 }} />
    </div>
);

const nodeTypes = { 
    familyMember: FamilyMemberNode,
    junction: JunctionNode
};

function FamilyTreePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isLocked, setIsLocked] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [targetMemberName, setTargetMemberName] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState(null); // Store household data
  
  const loadRealFamilyTree = useCallback(async () => {
    try {
        setLoading(true);
        if (!user) {
            setLoading(false);
            return;
        }

        let currentHouseholdId = user?.household_id;
        const currentUserId = user?.systemId || user?.member_id || user?.employeeId;

        let fetchedHousehold = null;
        if (!currentHouseholdId) {
          const houseRes = await fetchHouseholdBySubmittedBy(currentUserId || 'me');
          if (houseRes.success && houseRes.data) {
            fetchedHousehold = houseRes.data;
            currentHouseholdId = fetchedHousehold.household_id;
            setHousehold(fetchedHousehold); // Store household for head_member_name reference
          }
        }

        if (!currentHouseholdId) {
            setLoading(false);
            return;
        }

        const membersRes = await fetchFamilyMembers('?household_id=' + currentHouseholdId);
        if (!membersRes.success || !membersRes.data?.familyMembers?.length) {
            setLoading(false);
            return;
        }

        const familyMembers = membersRes.data.familyMembers;
        
        // Find the head - prioritize member with isHead:true, then match against household head name
        let primaryResident = familyMembers.find(m => m.isHead === true);

        const headMemberName = household?.head_member_name || fetchedHousehold?.head_member_name;
        if (!primaryResident && headMemberName) {
          // Fallback: match by household head name
          primaryResident = familyMembers.find(m => m.full_name === headMemberName);
        }
        
        // Last resort: take the first member (should not happen if isHead is set correctly)
        if (!primaryResident) {
            primaryResident = familyMembers[0];
            console.warn('Warning: Could not find head member, defaulting to first member:', primaryResident?.full_name);
        }

        const treeRes = await fetchFamilyTree(primaryResident.family_member_id);
        if (!treeRes.success) {
            setLoading(false);
            return;
        }

        const { member: rootMember, relationships } = treeRes.data;
        let newNodes = [];
        let newEdges = [];
        
        // Debug logging  
        console.log('Family tree roots:', rootMember.full_name);
        console.log('Total relationships fetched:', relationships.length);
        console.log('Relationships:', relationships.map(r => `${r.relatedMember.full_name} (${r.relationship})`));

        const cardWidth = 280;
        const cardHeight = 110;
        const hGap = 600; 
        const vGap = 250; 

        const headX = 1000; 
        const headY = 500;
        const headNodeId = 'node-' + rootMember.family_member_id;

        newNodes.push({
            id: headNodeId,
            type: 'familyMember',
            position: { x: headX, y: headY },
            data: { 
                label: rootMember.full_name, 
                gender: rootMember.gender,
                isUser: rootMember.full_name === user.full_name,
                diseases: rootMember.diseases || [],
                id: rootMember.family_member_id,
                onAddDisease: (name) => setTargetMemberName(name)
            },
            draggable: false
        });

        const spouses = relationships.filter(rel => rel.relationship?.toLowerCase().match(/wife|husband|spouse/));
        const parents = relationships.filter(rel => 
            (rel.relationship?.toLowerCase().match(/father|mother/)) && !rel.relationship?.toLowerCase().includes('in-law')
        );
        // Only parent-in-laws (mother-in-law, father-in-law of the head)
        const spouseParents = relationships.filter(rel => 
            rel.relationship?.toLowerCase().includes('mother-in-law') || 
            rel.relationship?.toLowerCase().includes('father-in-law')
        );
        // Children and their spouses (son-in-law, daughter-in-law)
        const children = relationships.filter(rel => 
            !rel.relationship?.toLowerCase().match(/wife|husband|spouse|father|mother|grand|aunt|uncle/) &&
            !rel.relationship?.toLowerCase().includes('in-law')
        );
        const childrenInLaws = relationships.filter(rel => 
            (rel.relationship?.toLowerCase().includes('son-in-law') || 
             rel.relationship?.toLowerCase().includes('daughter-in-law'))
        );
        const grandkids = relationships.filter(rel => 
            (rel.relationship?.toLowerCase().includes('grandson') || 
             rel.relationship?.toLowerCase().includes('granddaughter')) &&
            !rel.relationship?.toLowerCase().includes('in-law')
        );
        const grandchildrenInLaws = relationships.filter(rel => 
            (rel.relationship?.toLowerCase().includes('grandson-in-law') || 
             rel.relationship?.toLowerCase().includes('granddaughter-in-law'))
        );
        const greatGrandkids = relationships.filter(rel => rel.relationship?.toLowerCase().includes('great-grandchild'));

        // Debug: log all filtered arrays
        console.log('Spouses:', spouses.length, spouses.map(s => s.relatedMember.full_name));
        console.log('Parents:', parents.length, parents.map(p => p.relatedMember.full_name));
        console.log('Spouse Parents:', spouseParents.length, spouseParents.map(sp => sp.relatedMember.full_name));
        console.log('Children:', children.length, children.map(c => c.relatedMember.full_name));
        console.log('Children In-Laws:', childrenInLaws.length, childrenInLaws.map(c => c.relatedMember.full_name));
        console.log('Grandkids:', grandkids.length, grandkids.map(g => g.relatedMember.full_name));
        console.log('Grandchildren In-Laws:', grandchildrenInLaws.length, grandchildrenInLaws.map(g => g.relatedMember.full_name));
        console.log('Great-grandkids:', greatGrandkids.length, greatGrandkids.map(g => g.relatedMember.full_name));

// Grandparents (Resident Parents) - Symmetrical around head or single parent
        if (parents.length > 0) {
            const mil = parents.find(p => p.relatedMember.gender?.toLowerCase() === 'female');
            const fil = parents.find(p => p.relatedMember.gender?.toLowerCase() === 'male');
            const resParentJuncId = 'junc-res-parents';
            
            // Create junction if both parents exist, or direct connection if only one
            let junctionExists = false;
            if (mil && fil) {
                // Both parents: use junction
                const juncX = headX + 140;
                const juncY = headY - vGap + (cardHeight / 2);
                newNodes.push({ id: resParentJuncId, type: 'junction', position: { x: juncX, y: juncY }, draggable: false, data: {} });
                newEdges.push({ id: 'e-res-p-to-head', source: resParentJuncId, target: headNodeId, sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 3 } });
                junctionExists = true;
            }

            parents.forEach(p => {
                const isF = p.relatedMember.gender?.toLowerCase() === 'female';
                // Position: Female LEFT, Male RIGHT, both 280px from center at headX
                const pX = headX + (isF ? -280 : 280);
                const pY = headY - vGap;
                const pNodeId = 'node-' + p.relatedMember.family_member_id;
                newNodes.push({
                    id: pNodeId, type: 'familyMember', position: { x: pX, y: pY },
                    data: { label: p.relatedMember.full_name, gender: p.relatedMember.gender, diseases: p.relatedMember.diseases || [], id: p.relatedMember.family_member_id, onAddDisease: (name) => setTargetMemberName(name) },
                    draggable: false
                });
                // Connect to junction if it exists, otherwise connect directly to head
                if (junctionExists) {
                    newEdges.push({ id: 'e-res-p-' + pNodeId, source: pNodeId, target: resParentJuncId, sourceHandle: isF ? 'r' : 'l', targetHandle: isF ? 'l' : 'r', type: 'straight', style: { stroke: '#94a3b8', strokeWidth: 3 } });
                } else {
                    // Single parent: connect directly to head
                    newEdges.push({ id: 'e-res-p-' + pNodeId, source: pNodeId, target: headNodeId, sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 3 } });
                }
            });
        }

        // Spouse & Spouse Parents
        let mainJunctionId = null;
        if (spouses.length > 0) {
            const spouse = spouses[0];
            const spouseId = 'node-' + spouse.relatedMember.family_member_id;
            const spouseX = headX + cardWidth + hGap;
            newNodes.push({
                id: spouseId, type: 'familyMember', position: { x: spouseX, y: headY },
                data: { label: spouse.relatedMember.full_name, gender: spouse.relatedMember.gender, diseases: spouse.relatedMember.diseases || [], id: spouse.relatedMember.family_member_id, onAddDisease: (name) => setTargetMemberName(name) },
                draggable: false
            });

            mainJunctionId = 'junc-main-couple';
            newNodes.push({ id: mainJunctionId, type: 'junction', position: { x: headX + cardWidth + (hGap/2), y: headY + (cardHeight / 2) }, draggable: false, data: {} });
            newEdges.push({ id: 'e-h-junc', source: headNodeId, target: mainJunctionId, sourceHandle: 'r', targetHandle: 'l', type: 'straight', style: { stroke: '#94a3b8', strokeWidth: 3 } });
            newEdges.push({ id: 'e-s-junc', source: spouseId, target: mainJunctionId, sourceHandle: 'l', targetHandle: 'r', type: 'straight', style: { stroke: '#94a3b8', strokeWidth: 3 } });

            // Spouse Parents - Symmetrical around spouse or single parent
            if (spouseParents.length > 0) {
                const smil = spouseParents.find(p => p.relatedMember.gender?.toLowerCase() === 'female');
                const sfil = spouseParents.find(p => p.relatedMember.gender?.toLowerCase() === 'male');
                const spJuncId = 'junc-sp-parents';
                
                // Create junction if both spouse parents exist, or direct connection if only one
                let spouseParentJunctionExists = false;
                if (smil && sfil) {
                    const juncX = spouseX + 140;
                    const juncY = headY - vGap + (cardHeight / 2);
                    newNodes.push({ id: spJuncId, type: 'junction', position: { x: juncX, y: juncY }, draggable: false, data: {} });
                    newEdges.push({ id: 'e-sp-p-to-spouse', source: spJuncId, target: spouseId, sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 3 } });
                    spouseParentJunctionExists = true;
                }
                
                spouseParents.forEach(sp => {
                    const isF = sp.relatedMember.gender?.toLowerCase() === 'female';
                    // Position: Female LEFT, Male RIGHT, both 280px from center at spouseX
                    const spPX = spouseX + (isF ? -280 : 280);
                    const spPY = headY - vGap;
                    const spNodeId = 'node-' + sp.relatedMember.family_member_id;
                    newNodes.push({
                        id: spNodeId, type: 'familyMember', position: { x: spPX, y: spPY },
                        data: { label: sp.relatedMember.full_name, gender: sp.relatedMember.gender, diseases: sp.relatedMember.diseases || [], id: sp.relatedMember.family_member_id, onAddDisease: (name) => setTargetMemberName(name) },
                        draggable: false
                    });
                    // Connect to junction if it exists, otherwise connect directly to spouse
                    if (spouseParentJunctionExists) {
                        newEdges.push({ id: 'e-sp-p-' + spNodeId, source: spNodeId, target: spJuncId, sourceHandle: isF ? 'r' : 'l', targetHandle: isF ? 'l' : 'r', type: 'straight', style: { stroke: '#94a3b8', strokeWidth: 3 } });
                    } else {
                        // Single spouse parent: connect directly to spouse
                        newEdges.push({ id: 'e-sp-p-' + spNodeId, source: spNodeId, target: spouseId, sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 3 } });
                    }
                });
            }
        }

        // Calculate startX for children (used for both children and grandkids positioning)
        const coupleJuncX = mainJunctionId ? headX + cardWidth + (hGap/2) : headX + (cardWidth/2);
        const childHGap = 900;
        const rowWidth = children.length > 0 ? (children.length - 1) * childHGap : 0;
        const startX = coupleJuncX - (rowWidth / 2);

        // Children
        if (children.length > 0) {
            // Massively increased gap (900px) to prevent overlap when children have spouses
            children.forEach((child, idx) => {
                const cId = 'node-' + child.relatedMember.family_member_id;
                const cX = startX + (idx * childHGap) - (cardWidth / 2);
                const cY = headY + vGap;
                
                newNodes.push({
                    id: cId, type: 'familyMember', position: { x: cX, y: cY },
                    data: { label: child.relatedMember.full_name, gender: child.relatedMember.gender, diseases: child.relatedMember.diseases || [], id: child.relatedMember.family_member_id, onAddDisease: (name) => setTargetMemberName(name) },
                    draggable: false
                });
                newEdges.push({ id: 'e-child-' + cId, source: mainJunctionId || headNodeId, target: cId, sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 3 } });

                // Find the spouse (child-in-law like Lakni) and attach her to the correct child
                // For now, pair the first childrenInLaw with the first child if it exists
                const childSpouse = idx === 0 ? childrenInLaws[0] : null;

                // If this child has a spouse, pair them
                if (childSpouse) { 
                    const sId = 'node-' + childSpouse.relatedMember.family_member_id;
                    const sX = cX + cardWidth + 70; // 80px gap between husband and wife
                    
                    newNodes.push({
                        id: sId, type: 'familyMember', position: { x: sX, y: cY },
                        data: { 
                            label: childSpouse.relatedMember.full_name, 
                            gender: childSpouse.relatedMember.gender, 
                            diseases: childSpouse.relatedMember.diseases || [], 
                            id: childSpouse.relatedMember.family_member_id,
                            onAddDisease: (name) => setTargetMemberName(name)
                        },
                        draggable: false
                    });

                    const cJuncId = 'junc-child-' + idx;
                    // Junction centered between child and spouse
                    // Movin (cX) and Lakni (sX) - junction should be at midpoint between their centers
                    const juncX = cX + cardWidth + 35;  // = (child_center + spouse_center) / 2
                    newNodes.push({ id: cJuncId, type: 'junction', position: { x: juncX, y: cY + (cardHeight / 2) }, draggable: false, data: {} });
                    newEdges.push({ id: 'e-c-j1-' + idx, source: cId, target: cJuncId, sourceHandle: 'r', targetHandle: 'l', type: 'straight', style: { stroke: '#94a3b8', strokeWidth: 2 } });
                    newEdges.push({ id: 'e-c-j2-' + idx, source: sId, target: cJuncId, sourceHandle: 'l', targetHandle: 'r', type: 'straight', style: { stroke: '#94a3b8', strokeWidth: 2 } });
                }
            });
        }

        // Grandkids
        if (grandkids.length > 0 && children.length > 0) {
            // Only position grandkids if there are actual children
            // Check if junc-child-0 exists (junction for first child-spouse pair)
            const firstChildJunctionExists = newNodes.some(n => n.id === 'junc-child-0');
            
            if (firstChildJunctionExists) {
                grandkids.forEach((gk, idx) => {
                    const gkId = 'node-' + gk.relatedMember.family_member_id;
                    // Position grandkids under the first child pair (Movin & Lakni)
                    // If children exist, use their positioning
                    const firstChildIdx = 0;
                    const firstChildX = startX + (firstChildIdx * childHGap) - (cardWidth / 2);
                    const gkX = firstChildX + (cardWidth / 2) + 35 + (idx * 300) - (cardWidth / 2);
                    newNodes.push({
                        id: gkId, type: 'familyMember', position: { x: gkX, y: headY + (vGap * 2) },
                        data: { label: gk.relatedMember.full_name, gender: gk.relatedMember.gender, diseases: gk.relatedMember.diseases || [], id: gk.relatedMember.family_member_id, onAddDisease: (name) => setTargetMemberName(name) },
                        draggable: false
                    });
                    // Connect to the child couple junction if it exists
                    const sourceId = 'junc-child-0'; // Junction for first child-spouse pair
                    newEdges.push({ id: 'e-gk-' + gkId, source: sourceId, target: gkId, sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2, strokeDasharray: '5,5' } });
                });
            } else {
                console.warn('First child junction (junc-child-0) not found, grandkids cannot be displayed');
            }
        }

        // Grandchildren-in-laws (spouses of grandchildren like Baby's wife)
        if (grandchildrenInLaws.length > 0 && grandkids.length > 0) {
            // Pair grandchildren with their in-laws if they have parent_name that matches a grandchild
            grandchildrenInLaws.forEach((gkl, idx) => {
                const gklId = 'node-' + gkl.relatedMember.family_member_id;
                const parentName = gkl.relatedMember.parent_name;
                
                // Find the matching grandchild by name
                const matchingGrandchild = grandkids.find(gk => gk.relatedMember.full_name === parentName);
                
                if (matchingGrandchild) {
                    // Position next to their grandchild spouse
                    const grandchildNode = newNodes.find(n => n.id === 'node-' + matchingGrandchild.relatedMember.family_member_id);
                    if (grandchildNode) {
                        const gkX = grandchildNode.position.x;
                        const gkY = grandchildNode.position.y;
                        const gklX = gkX + cardWidth + 70; // Same spacing as children-spouse
                        
                        newNodes.push({
                            id: gklId, type: 'familyMember', position: { x: gklX, y: gkY },
                            data: { label: gkl.relatedMember.full_name, gender: gkl.relatedMember.gender, diseases: gkl.relatedMember.diseases || [], id: gkl.relatedMember.family_member_id, onAddDisease: (name) => setTargetMemberName(name) },
                            draggable: false
                        });
                        
                        // Create junction between grandchild and their spouse (same as children-spouse pattern)
                        const gklJuncId = 'junc-gkl-' + idx;
                        const gklJuncX = gkX + cardWidth + 35; // Midpoint between grandchild and grandchild-in-law
                        newNodes.push({ id: gklJuncId, type: 'junction', position: { x: gklJuncX, y: gkY + (cardHeight / 2) }, draggable: false, data: {} });
                        
                        // Connect grandchild to junction and spouse to junction
                        newEdges.push({ id: 'e-gkl-j1-' + idx, source: grandchildNode.id, target: gklJuncId, sourceHandle: 'r', targetHandle: 'l', type: 'straight', style: { stroke: '#94a3b8', strokeWidth: 2 } });
                        newEdges.push({ id: 'e-gkl-j2-' + idx, source: gklId, target: gklJuncId, sourceHandle: 'l', targetHandle: 'r', type: 'straight', style: { stroke: '#94a3b8', strokeWidth: 2 } });
                    }
                }
            });
        }

        // Great-grandchildren (children of grandchildren)
        if (greatGrandkids.length > 0) {
            greatGrandkids.forEach((ggk, idx) => {
                const ggkId = 'node-' + ggk.relatedMember.family_member_id;
                const parentName = ggk.relatedMember.parent_name;
                
                // Find the matching grandchild (parent) by name
                const matchingParent = grandkids.find(gk => gk.relatedMember.full_name === parentName);
                
                if (matchingParent) {
                    const parentNode = newNodes.find(n => n.id === 'node-' + matchingParent.relatedMember.family_member_id);
                    if (parentNode) {
                        // Check if this grandchild has a spouse by finding the matching in-law
                        const gklIndex = grandchildrenInLaws.findIndex(gkl => gkl.relatedMember.parent_name === parentName);
                        let sourceNodeId = parentNode.id;
                        let sourceX = parentNode.position.x;
                        let sourceY = parentNode.position.y;
                        
                        // If there's a junction (couple), use that as the source instead
                        if (gklIndex !== -1) {
                            const junctionId = 'junc-gkl-' + gklIndex;
                            const junctionNode = newNodes.find(n => n.id === junctionId);
                            if (junctionNode) {
                                sourceNodeId = junctionId;
                                sourceX = junctionNode.position.x;
                                sourceY = junctionNode.position.y;
                            }
                        }
                        
                        // Position below and centered on source (parent or junction)
                        const ggkX = sourceX;
                        const ggkY = sourceY + vGap;
                        
                        newNodes.push({
                            id: ggkId, type: 'familyMember', position: { x: ggkX, y: ggkY },
                            data: { label: ggk.relatedMember.full_name, gender: ggk.relatedMember.gender, diseases: ggk.relatedMember.diseases || [], id: ggk.relatedMember.family_member_id, onAddDisease: (name) => setTargetMemberName(name) },
                            draggable: false
                        });
                        
                        // Connect to source (parent or junction)
                        newEdges.push({ id: 'e-ggk-' + ggkId, source: sourceNodeId, target: ggkId, sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2, strokeDasharray: '5,5' } });
                    }
                }
            });
        }

        setNodes(newNodes);
        setEdges(newEdges);
    } catch (err) {
        console.error('Error loading family tree:', err);
    } finally {
        setLoading(false);
    }
  }, [user, setNodes, setEdges, setTargetMemberName]);

  useEffect(() => {
    loadRealFamilyTree();
  }, [loadRealFamilyTree]);

  const handleUpdateDiseases = async () => {
    if (!targetMemberName) return;
    const diseaseInput = document.getElementById('disease-input').value;
    const diseaseList = diseaseInput.split(',').map(d => d.trim()).filter(d => d);
    try {
        setLoading(true);
        const targetNode = nodes.find(n => n.data?.label === targetMemberName);
        if (!targetNode) return;
        const res = await updateFamilyMember(targetNode.data.id, { diseases: diseaseList });
        if (res.success) {
          toast.success(t('familyTree.toast.updated'));
            setTargetMemberName(null);
            loadRealFamilyTree();
        }
    } catch (err) {
        console.error("Error updating family member:", err);
        toast.error(getSafeErrorMessage(err, "contact"));
    } finally {
        setLoading(false);
    }
  };

  const toggleDiseaseOnNode = (disease) => {
    const targetNode = nodes.find(n => n.data?.label === targetMemberName);
    if (!targetNode) return;

    const currentDiseases = targetNode.data.diseases || [];
    let updatedDiseases;

    if (currentDiseases.includes(disease)) {
      updatedDiseases = currentDiseases.filter(d => d !== disease);
    } else {
      updatedDiseases = [...currentDiseases, disease];
    }

    setNodes(nodes.map(n => 
      n.id === targetNode.id 
        ? { ...n, data: { ...n.data, diseases: updatedDiseases } }
        : n
    ));
  };

  const saveDiseases = async () => {
    if (!targetMemberName) return;
    try {
      setLoading(true);
      const targetNode = nodes.find(n => n.data?.label === targetMemberName);
      if (!targetNode) {
        console.error('Target node not found');
        toast.error(t('familyTree.error.memberNotFound'));
        return;
      }
      
      console.log('Saving diseases for member:', targetNode.data.id, targetNode.data.diseases);
      const res = await updateFamilyMember(targetNode.data.id, { diseases: targetNode.data.diseases || [] });
      console.log('API Response:', res);
      
      if (res && res.success) {
        toast.success(t('familyTree.toast.updated'));
        setTargetMemberName(null);
        loadRealFamilyTree();
      } else {
        console.error('API response not successful:', res);
        toast.error(getSafeErrorMessage(new Error(res?.message), "contact"));
      }
    } catch (err) {
      console.error('Error saving diseases:', err);
      toast.error(getSafeErrorMessage(err, "contact"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className='h-[calc(100vh-64px)] w-full bg-slate-50 flex flex-col'>
        {/* Header - Static at top */}
        <div className='flex items-center justify-between px-6 py-4'>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t('familyTree.title')}</h1>
              <p className="text-slate-400 text-[15px] font-bold mt-0.5 ">
                {loading
                  ? t('familyTree.loading')
                  : `${t('familyTree.residentLabel')}: ${user?.full_name || t('familyTree.anonymous')}`}
              </p>
            </div>

            {/* Instructions bar removed as requested */}
            <button onClick={loadRealFamilyTree} className='bg-white border-2 border-slate-200 p-3 rounded-2xl text-slate-600 hover:border-teal-500 hover:text-teal-600 transition-all shadow-lg'>
                <svg className={'w-5 h-5 ' + (loading ? 'animate-spin' : '')} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                </svg>
            </button>
        </div>

        <div className="flex-1 bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative group">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-bold animate-pulse">{t('familyTree.loading')}</p>
                </div>
            </div>
          ) : nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="text-5xl mb-4">🌳</div>
                <h3 className="text-xl font-bold text-slate-800">{t('familyTree.empty.title')}</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">{t('familyTree.empty.body')}</p>
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
            <div className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4'>
                <div className='bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300'>
                    <div className='flex justify-between items-center px-8 py-6 border-b border-slate-100'>
                        <h2 className='text-xl font-bold uppercase text-slate-800'>{t('familyTree.modal.title', { name: targetMemberName })}</h2>
                        <button onClick={() => setTargetMemberName(null)} className='text-slate-400 hover:text-slate-600'><svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M6 18L18 6M6 6l12 12' /></svg></button>
                    </div>

                    <div className='flex-1 overflow-y-auto'>
                        <div className='px-8 py-6'>
                          {/* Category 1 */}
                          <div className='mb-4 flex items-center gap-3'>
                            <div className='w-1 h-4 bg-rose-500 rounded-full' />
                            <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]'>{t('familyTree.modal.category1')}</h3>
                          </div>

                          <div className='grid grid-cols-3 gap-3 mb-8'>
                            {['Diabetes (Type 2)', 'Hypertension', 'Heart Disease', 'Stroke', 'Asthma', 'Kidney Disease', 'CKDu (Sri Lanka)', 'Cancer (Any Type)', 'Mental Health (Depression/Anxiety)'].map(disease => {
                              const isSelected = nodes.find(n => n.data?.label === targetMemberName)?.data.diseases?.includes(disease);
                              return (
                                <button key={disease} onClick={() => toggleDiseaseOnNode(disease)} className={`group relative p-3 rounded-2xl border-2 text-left transition-all duration-200 ${isSelected ? 'bg-rose-50/50 border-rose-500 text-rose-700 shadow-sm scale-[1.01]' : 'bg-white border-slate-100 text-slate-600 hover:border-rose-500 hover:bg-rose-50/20 shadow-sm'}`}>
                                  <div className='flex items-center justify-between pointer-events-none gap-2'>
                                    <span className='font-bold text-[11.5px] leading-tight'>{disease}</span>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-200 group-hover:border-rose-300'}`}>
                                      {isSelected && <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'><path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' /></svg>}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Category 2 */}
                          <div className='mb-4 flex items-center gap-3'>
                            <div className='w-1 h-4 bg-purple-500 rounded-full' />
                            <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]'>{t('familyTree.modal.category2')}</h3>
                          </div>

                          <div className='grid grid-cols-3 gap-3 mb-8'>
                            {['Thalassemia (Alpha/Beta)', 'Sickle Cell Disease', 'Inherited Platelet Disorder', 'Homocystinuria', 'Cystic Fibrosis', 'Spinocerebellar Ataxia', 'Epilepsy (Genetic)', 'Autism Spectrum Disorder', 'Skeletal Dysplasia', 'Congenital Deformity', 'Inherited Breast Cancer (BRCA)', 'Familial Colorectal Cancer', 'Familial Hypercholesterolemia'].map(disease => {
                              const isSelected = nodes.find(n => n.data?.label === targetMemberName)?.data.diseases?.includes(disease);
                              return (
                                <button key={disease} onClick={() => toggleDiseaseOnNode(disease)} className={`group relative p-3 rounded-2xl border-2 text-left transition-all duration-200 ${isSelected ? 'bg-purple-50/50 border-purple-500 text-purple-700 shadow-sm scale-[1.01]' : 'bg-white border-slate-100 text-slate-600 hover:border-purple-500 hover:bg-purple-50/20 shadow-sm'}`}>
                                  <div className='flex items-center justify-between pointer-events-none gap-2'>
                                    <span className='font-bold text-[11.5px] leading-tight'>{disease}</span>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-200 group-hover:border-purple-300'}`}>
                                      {isSelected && <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'><path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' /></svg>}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Category 3 */}
                          <div className='mb-4 flex items-center gap-3'>
                            <div className='w-1 h-4 bg-blue-500 rounded-full' />
                            <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]'>{t('familyTree.modal.category3')}</h3>
                          </div>

                          <div className='grid grid-cols-3 gap-3 mb-8'>
                            {['Down Syndrome', 'Turner Syndrome', 'Klinefelter Syndrome', 'Hemophilia', 'Muscular Dystrophy', "Huntington's Disease", 'Tay-Sachs Disease', 'Congenital Hypothyroidism', 'Diabetes (Type 1 Genetic Link)'].map(disease => {
                              const isSelected = nodes.find(n => n.data?.label === targetMemberName)?.data.diseases?.includes(disease);
                              return (
                                <button key={disease} onClick={() => toggleDiseaseOnNode(disease)} className={`group relative p-3 rounded-2xl border-2 text-left transition-all duration-200 ${isSelected ? 'bg-blue-50/50 border-blue-500 text-blue-700 shadow-sm scale-[1.01]' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-500 hover:bg-blue-50/20 shadow-sm'}`}>
                                  <div className='flex items-center justify-between pointer-events-none gap-2'>
                                    <span className='font-bold text-[11.5px] leading-tight'>{disease}</span>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-200 group-hover:border-blue-300'}`}>
                                      {isSelected && <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'><path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' /></svg>}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                    </div>

                    <div className='px-8 py-4 border-t border-slate-100 flex gap-3'>
                        <button onClick={() => setTargetMemberName(null)} className='flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all'>{t('familyTree.modal.cancel')}</button>
                        <button onClick={saveDiseases} className='flex-1 px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all'>{t('familyTree.modal.save')}</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </PublicLayout>
  );
}

export default FamilyTreePage;
