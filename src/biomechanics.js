import * as THREE from 'three';
/** Fixed-length analytic IK. Targets are clamped to an anatomical flexion interval. */
export function solveLimb(origin,target,pole,l1,l2,minFlex=8,maxFlex=150){
  const lower=Math.sqrt(l1*l1+l2*l2+2*l1*l2*Math.cos(maxFlex*Math.PI/180));
  const upper=Math.sqrt(l1*l1+l2*l2+2*l1*l2*Math.cos(minFlex*Math.PI/180));
  const axis=target.clone().sub(origin),requested=axis.length();if(requested<1e-7)axis.set(0,-1,0);else axis.divideScalar(requested);
  const d=THREE.MathUtils.clamp(requested,lower,upper),end=origin.clone().addScaledVector(axis,d);
  const direction=pole.clone().sub(origin).addScaledVector(axis,-pole.clone().sub(origin).dot(axis));
  if(direction.lengthSq()<1e-8)direction.set(1,0,0).addScaledVector(axis,-axis.x);direction.normalize();
  const axial=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-axial*axial));
  const joint=origin.clone().addScaledVector(axis,axial).addScaledVector(direction,height);
  return{joint,end,flexDegrees:Math.acos(THREE.MathUtils.clamp((d*d-l1*l1-l2*l2)/(2*l1*l2),-1,1))*180/Math.PI,reachError:Math.abs(requested-d)};
}
/** Closest points between two finite blade segments, including parallel blades. */
export function bladeContact(p1,q1,p2,q2){
  const d1=q1.clone().sub(p1),d2=q2.clone().sub(p2),r=p1.clone().sub(p2),a=d1.lengthSq(),e=d2.lengthSq(),f=d2.dot(r);let s=0,t=0;
  if(a<=1e-8&&e<=1e-8)return{distance:p1.distanceTo(p2),point:p1.clone().add(p2).multiplyScalar(.5),s,t};
  if(a<=1e-8)t=THREE.MathUtils.clamp(f/e,0,1);
  else{const c=d1.dot(r);if(e<=1e-8)s=THREE.MathUtils.clamp(-c/a,0,1);else{const b=d1.dot(d2),denom=a*e-b*b;s=denom!==0?THREE.MathUtils.clamp((b*f-c*e)/denom,0,1):0;t=(b*s+f)/e;if(t<0){t=0;s=THREE.MathUtils.clamp(-c/a,0,1);}else if(t>1){t=1;s=THREE.MathUtils.clamp((b-c)/a,0,1);}}}
  const v1=p1.clone().addScaledVector(d1,s),v2=p2.clone().addScaledVector(d2,t);return{distance:v1.distanceTo(v2),point:v1.add(v2).multiplyScalar(.5),s,t};
}
