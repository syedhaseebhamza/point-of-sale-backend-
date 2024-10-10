
// middleware to Authorize Role
function authenticateRole(req,res,next){
    const user = req.user;
    if(!user){
      return res.status(401).json({message:"unauthorized"});
    }
    const role = user.role;
    if(role!=='superadmin'){
      return res.status(403).json({message:"Only Admin Allowed"});
    }
    next();
  }

module.exports = authenticateRole