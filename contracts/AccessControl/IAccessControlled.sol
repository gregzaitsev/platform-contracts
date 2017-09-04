pragma solidity 0.4.15;

import './IAccessPolicy.sol';


contract IAccessControlled {

    ////////////////////////
    // Events
    ////////////////////////

    event AccessPolicyChanged(
        address controler,
        IAccessPolicy oldPolicy,
        IAccessPolicy newPolicy
    );

    ////////////////////////
    // Public functions
    ////////////////////////

    function accessPolicy()
        public
        constant
        returns (IAccessPolicy);

}
