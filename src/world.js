import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createWeather} from './weather.js';
import {detailedRuins} from './ruins.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {FINAL_CUTS} from './cinematic.js';
import {weatheredSurface} from './surface.js';
export function createWorld(scene,renderer){
  let seed=7324;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  scene.background=new THREE.Color('#0a1117');scene.fog=new THREE.FogExp2('#0b151b',.023);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.08).texture;scene.environmentIntensity=.19;room.dispose();pmrem.dispose();
  const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d'),img=ctx.createImageData(512,512);
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4,v=44+rand()*19+Math.sin(x*.11+Math.sin(y*.08)*4)*3;img.data[i]=v*.89;img.data[i+1]=v*.98;img.data[i+2]=v;img.data[i+3]=255;}ctx.putImageData(img,0,0);
  ctx.strokeStyle='#0b1415';ctx.lineWidth=1.2;for(let i=0;i<28;i++){ctx.beginPath();let x=rand()*512,y=rand()*512;ctx.moveTo(x,y);for(let j=0;j<8;j++){x+=rand()*45-22;y+=rand()*45-22;ctx.lineTo(x,y);}ctx.stroke();}
  const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(6,6);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const stone=new THREE.MeshPhysicalMaterial({color:'#858b82',map:tex,roughness:.87,metalness:.01,bumpMap:tex,bumpScale:.08,clearcoat:.30,clearcoatRoughness:.31});
  const floorMat=new THREE.MeshPhysicalMaterial({color:'#424c51',map:tex,metalness:.02,roughness:.25,clearcoat:1,clearcoatRoughness:.16,bumpMap:tex,bumpScale:.022});
  function block(w,h,d,x,y,z,mat=stone){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
  const ground=new THREE.Mesh(new THREE.CircleGeometry(40,96),stone);ground.rotation.x=-Math.PI/2;ground.position.y=-.13;ground.receiveShadow=true;scene.add(ground);
  const stage=new THREE.Mesh(new THREE.CylinderGeometry(7.2,7.6,.24,96),floorMat);stage.position.y=-.095;stage.receiveShadow=true;scene.add(stage);
  const reflector=new Reflector(new THREE.CircleGeometry(6.95,80),{textureWidth:768,textureHeight:768,color:0x18252d,clipBias:.004,multisample:0});reflector.rotation.x=-Math.PI/2;reflector.position.y=.028;scene.add(reflector);
  reflector.material.uniforms.wetTime={value:0};reflector.material.uniforms.stoneMap={value:tex};reflector.material.vertexShader=reflector.material.vertexShader.replace('void main()', 'varying vec2 vFloorUv;\nvoid main()').replace('vUv = textureMatrix * vec4( position, 1.0 );','vFloorUv=uv; vUv = textureMatrix * vec4( position, 1.0 );');
  reflector.material.fragmentShader=reflector.material.fragmentShader.replace('void main()', 'uniform float wetTime;uniform sampler2D stoneMap;varying vec2 vFloorUv;\nvoid main()').replace('vec4 base = texture2DProj( tDiffuse, vUv );','vec2 coord=vUv.xy/vUv.w;vec2 ripple=vec2(sin(vFloorUv.y*175.+wetTime*6.),cos(vFloorUv.x*147.-wetTime*5.))*.00065;vec4 base=texture2D(tDiffuse,coord+ripple)*.55+texture2D(tDiffuse,coord+ripple+vec2(.0015,0.))*.225+texture2D(tDiffuse,coord+ripple-vec2(.0015,0.))*.225;').replace('gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );','vec3 s=texture2D(stoneMap,vFloorUv*5.).rgb;float pool=smoothstep(.10,.24,s.r);gl_FragColor=vec4(mix(s*.18,base.rgb*vec3(.25,.32,.35),.32+pool*.42),1.0);');
  // Sparse stone slabs interrupt the wet planar reflection instead of making a perfect mirror.
  for(let i=0;i<32;i++){const a=i/32*Math.PI*2,r=7;const tile=block(1.25,.11,.75,Math.cos(a)*r,.025,Math.sin(a)*r);tile.rotation.y=-a+Math.PI/2;}
  const ringMat=new THREE.MeshStandardMaterial({color:'#978666',emissive:'#bc8140',emissiveIntensity:.19,roughness:.43,metalness:.8});
  for(const radius of [4.85,6.75]){const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.013,5,120),ringMat);ring.rotation.x=Math.PI/2;ring.position.y=.042;scene.add(ring);}
  const grooveMat=new THREE.MeshBasicMaterial({color:'#556362',transparent:true,opacity:.3});
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,curve=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a)*4.9,.045,Math.sin(a)*4.9),new THREE.Vector3(Math.cos(a)*6.7,.045,Math.sin(a)*6.7)]);scene.add(new THREE.Line(curve,grooveMat));}
  for(let i=0;i<18;i++){
    const a=i/18*Math.PI*2,r=13.3,x=Math.sin(a)*r,z=Math.cos(a)*r,h=7+rand()*6;
    if(z>8&&Math.abs(x)<6)continue;
    block(1.55,h,1.55,x,h/2-.1,z);block(2.2,.3,2.2,x,.13,z);block(1.9,.45,1.9,x,h,z);
    for(const offset of [-.38,.38])block(.09,h-.7,.07,x+offset,h/2,z+.81,new THREE.MeshStandardMaterial({color:'#6e746f',metalness:.55,roughness:.54}));
    if(i%3!==0){const beam=block(4.1,.7,1.55,x+Math.cos(a)*1.25,h+.5,z-Math.sin(a)*1.25);beam.rotation.y=a;beam.rotation.z=(rand()-.5)*.12;}
  }
  const ruins=detailedRuins(scene,stone);
  const rockGeo=mergeVertices(new THREE.IcosahedronGeometry(1,2));const rp=rockGeo.attributes.position;for(let i=0;i<rp.count;i++){const x=rp.getX(i),y=rp.getY(i),z=rp.getZ(i),v=.85+.13*Math.sin(x*5.2+z*3.6)+.09*Math.sin(y*7.1-x*2.4);rp.setXYZ(i,x*v,y*v,z*v);}rockGeo.computeVertexNormals();
  for(let i=0;i<75;i++){const a=rand()*Math.PI*2,r=8.2+rand()*12,s=.16+rand()*.95;const rock=new THREE.Mesh(rockGeo,stone);rock.position.set(Math.cos(a)*r,s*.35,Math.sin(a)*r);rock.scale.set(s,s*.7,s);rock.rotation.set(rand()*2,rand()*6,rand()*2);rock.castShadow=true;rock.receiveShadow=true;scene.add(rock);}
  const debris=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.1,0),stone,240),dummy=new THREE.Object3D();for(let i=0;i<240;i++){const a=rand()*6.283,r=7.5+rand()*14;dummy.position.set(Math.cos(a)*r,.015,Math.sin(a)*r);dummy.scale.setScalar(.3+rand()*1.7);dummy.rotation.set(rand(),rand()*6,rand());dummy.updateMatrix();debris.setMatrixAt(i,dummy.matrix);}debris.receiveShadow=true;scene.add(debris);
  scene.add(new THREE.HemisphereLight('#85a6b9','#1b1815',.65));
  const moon=new THREE.DirectionalLight('#87b9df',2.5);moon.position.set(-5,14,-9);scene.add(moon);
  const key=new THREE.SpotLight('#ffe5b8',900,40,.54,.75,2);key.position.set(3.5,13,-4.8);key.target.position.set(0,0,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0002;key.shadow.normalBias=.025;scene.add(key,key.target);
  const fill=new THREE.DirectionalLight('#d3e8eb',.8);fill.position.set(3,5,12);scene.add(fill);
  const back=new THREE.SpotLight('#9bbdd2',1250,45,.8,.9,2);back.position.set(-4,12,-12);back.target.position.set(0,2,0);scene.add(back,back.target);
  const beamMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{color:{value:new THREE.Color('#d8e1c7')}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform vec3 color;void main(){float edge=pow(max(0.,sin(vUv.x*3.14159)),2.);float a=edge*pow(vUv.y,.8)*.035;gl_FragColor=vec4(color,a);}'});
  for(let i=0;i<3;i++){const start=new THREE.Vector3(3.5+i*.9,13,-4.8-i*1.8),end=new THREE.Vector3(-.5+i*2.2,0,-1+i*.8),delta=start.clone().sub(end);const beam=new THREE.Mesh(new THREE.ConeGeometry(1.8+i*.5,delta.length(),28,1,true),beamMat);beam.position.copy(start).add(end).multiplyScalar(.5);beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());scene.add(beam);}
  const dustN=250,positions=new Float32Array(dustN*3);for(let i=0;i<dustN;i++){positions[i*3]=(rand()-.5)*30;positions[i*3+1]=rand()*13;positions[i*3+2]=(rand()-.5)*28;}
  const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:'#d7dcca',size:.035,transparent:true,opacity:.45,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(dust);
  const rainN=450,rainPos=new Float32Array(rainN*6),rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:'#8ca5ae',transparent:true,opacity:.15,depthWrite:false}));rain.visible=false;scene.add(rain);
  const rainSeed=Array.from({length:rainN},()=>[(rand()-.5)*28,rand()*16,(rand()-.5)*28]);
  const weather=createWeather(scene);
  const surface=weatheredSurface(scene);
  const lightning=new THREE.DirectionalLight('#c0d8ed',0);lightning.position.set(-3,19,-20);scene.add(lightning);
  const boltPoints=[];let bx=-7;for(let y=23;y>5;y-=1.2){bx+=(rand()-.5)*1.8;boltPoints.push(new THREE.Vector3(bx,y,-20));}const bolt=new THREE.Line(new THREE.BufferGeometry().setFromPoints(boltPoints),new THREE.LineBasicMaterial({color:new THREE.Color(7,8,10),transparent:true,opacity:0,toneMapped:false}));scene.add(bolt);
  return{reflector,weather,ruins,surface,stone,update(t){dust.rotation.y=t*.009;weather.update(t);surface.update(t);reflector.material.uniforms.wetTime.value=t;const u=t%17.3-3.1,flash=u>0&&u<.25?Math.pow(Math.max(0,Math.sin(u*90)),6):0;const cue=[67.142857,89.285714,...FINAL_CUTS].reduce((v,at)=>{const d=t-at;return Math.max(v,d>=-.035&&d<.34?Math.exp(-Math.max(0,d)*12):0);},0);lightning.intensity=flash*4+cue*5;bolt.material.opacity=Math.max(flash,cue);moon.intensity=2.5+cue*2.2;key.intensity=900+cue*400;scene.background.copy(new THREE.Color('#0a1117')).lerp(new THREE.Color('#456078'),cue*.24);}};
}
