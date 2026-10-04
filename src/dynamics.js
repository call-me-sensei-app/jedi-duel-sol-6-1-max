/** Ballistic hilt toss with damped ground restitution and horizontal friction. */
export function bouncingToss(age,origin,target=[1.5,.08,.65],flight=.66){
  const g=9.81,floor=target[1],v=[(target[0]-origin[0])/flight,(floor-origin[1]+.5*g*flight*flight)/flight,(target[2]-origin[2])/flight];age=Math.max(0,age);
  if(age<=flight)return{position:[origin[0]+v[0]*age,origin[1]+v[1]*age-.5*g*age*age,origin[2]+v[2]*age],bounce:0,settled:false};
  let remain=age-flight,vy=Math.abs(v[1]-g*flight)*.35,vx=v[0]*.68,vz=v[2]*.68,x=target[0],z=target[2];
  for(let bounce=1;bounce<=4;bounce++){const duration=2*vy/g,dt=Math.min(remain,duration);x+=vx*dt;z+=vz*dt;const y=floor+vy*dt-.5*g*dt*dt;if(remain<=duration)return{position:[x,Math.max(floor,y),z],bounce,settled:false};remain-=duration;vy*=.35;vx*=.58;vz*=.58;}
  return{position:[x,floor,z],bounce:4,settled:true};
}
