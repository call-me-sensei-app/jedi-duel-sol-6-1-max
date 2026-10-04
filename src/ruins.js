import * as THREE from 'three';import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export function detailedRuins(scene,stone){
  let seed=271;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const geometries=[];
  function add(g,x,y,z,rotation=0){const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),rotation),new THREE.Vector3(1,1,1));g.applyMatrix4(m);geometries.push(g);}
  function brick(w,h,d,x,y,z,rot=0){const shape=new THREE.Shape();shape.moveTo(-w/2,-h/2);shape.lineTo(w/2,-h/2);shape.lineTo(w/2,h/2);shape.lineTo(-w/2,h/2);shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:d,steps:1,bevelEnabled:true,bevelSegments:1,bevelSize:.025,bevelThickness:.025,curveSegments:1});g.translate(0,0,-d/2);add(g,x,y,z,rot);}
  // Real masonry courses: mortar gaps, beveled/chipped edges, missing blocks and broken silhouettes.
  for(const side of [-1,1])for(let row=0;row<26;row++)for(let col=0;col<11;col++){
    const x=side*(3.5+col*.77),y=.23+row*.43,z=-14.4;
    if(row>14&&rnd()<(row-14)*.052||row>5&&rnd()<.045)continue;
    brick(.72+rnd()*.035,.38+rnd()*.016,1.0+rnd()*.18,x+(row%2)*.36*side,y,z+rnd()*.09);
  }
  // A ruined monumental arch, assembled from individual load-bearing voussoirs.
  const centerX=-.4,centerY=5.5,radius=3.4;
  for(let i=0;i<25;i++){if(i>20&&i<24)continue;const a=i/25*Math.PI,b=(i+1)/25*Math.PI,outer=radius+.74+(rnd()-.5)*.07;const shape=new THREE.Shape();shape.moveTo(Math.cos(a)*radius,Math.sin(a)*radius);shape.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);shape.lineTo(Math.cos(b)*outer,Math.sin(b)*outer);shape.lineTo(Math.cos(b)*radius,Math.sin(b)*radius);shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:1.3,bevelEnabled:true,bevelSize:.027,bevelThickness:.02,bevelSegments:1,steps:1});g.translate(0,0,-.65);add(g,centerX,centerY,-12.7);}
  for(const side of [-1,1])for(let y=.23;y<5.6;y+=.44)for(let col=0;col<2;col++)brick(.64,.39,1.35,centerX+side*(3.43+col*.66),y,-12.7);
  for(let row=0;row<5;row++)for(let col=0;col<14;col++){if(rnd()<.13)continue;brick(.57,.22,1.0,(col-7)*.6,-.17-row*.21,-11.7+row*.86);}
  // Buttresses, recessed carved panels and eroded capital bands on all temple columns.
  for(let i=0;i<18;i++){const a=i/18*Math.PI*2,r=13.3,x=Math.sin(a)*r,z=Math.cos(a)*r;if(z>8&&Math.abs(x)<6)continue;
    for(let row=0;row<18;row++){if(row>12&&rnd()<.20)continue;brick(1.62,.045,1.62,x,row*.47+.47,z,a);}
    for(let j=0;j<5;j++)brick(2.1-j*.12,.18,2.1-j*.12,x,j*.17+.10,z,a);
    for(let j=0;j<4;j++){const g=new THREE.BoxGeometry(.045,5.4,.11);add(g,x+Math.cos(a)*(.5-j*.33),3.5,z-Math.sin(a)*(.5-j*.33),a);}
  }
  const combined=mergeGeometries(geometries.map(g=>g.index?g.toNonIndexed():g));for(const g of geometries)g.dispose();const masonry=new THREE.Mesh(combined,stone);masonry.castShadow=true;masonry.receiveShadow=true;scene.add(masonry);
  const carvedMat=new THREE.MeshStandardMaterial({color:'#6e746d',metalness:.22,roughness:.8});const ornaments=[];
  for(const x of [-3.95,3.15]){const panel=new THREE.Mesh(new THREE.BoxGeometry(.38,3.4,.12),carvedMat);panel.position.set(x,3.1,-11.96);scene.add(panel);for(let j=0;j<12;j++){const c=new THREE.Mesh(new THREE.TorusGeometry(.10,.009,4,12),carvedMat);c.position.set(x,1.64+j*.26,-11.86);c.scale.y=.6;c.rotation.z=j%2?Math.PI/4:0;scene.add(c);ornaments.push(c);}}
  const trim=new THREE.MeshStandardMaterial({color:'#6d5f45',metalness:.72,roughness:.5,emissive:'#6b3514',emissiveIntensity:.2});
  for(const x of [-3.95,3.15]){const s=new THREE.Mesh(new THREE.BoxGeometry(.35,.18,.40),trim);s.position.set(x,3.55,-11.7);scene.add(s);const glow=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),new THREE.MeshBasicMaterial({color:new THREE.Color(3,.9,.22),toneMapped:false}));glow.position.set(x,3.68,-11.7);scene.add(glow);const l=new THREE.PointLight('#ffac68',9,4,2);l.position.copy(glow.position);scene.add(l);}
  return{masonry,blocks:geometries.length,ornaments:ornaments.length};
}
