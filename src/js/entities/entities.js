/**
 * Player Entity
 */
game.PlayerEntity = me.Entity.extend({

    /**
     * constructor
     */
    init : function(x, y, settings) {
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);

        // max walking and jumping spee
        this.body.setMaxVelocity(2, 2);
        this.body.setFriction(0.4, 0);

        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH, 0.4);

        // ensure the player is updated even when outside of the viewport
        this.alwaysUpdate = true;

        // define a basic walking animation (using all frames)
        this.renderable.addAnimation('walk', [0, 1, 2]);

        // define a standing animation (using the first frame)
        this.renderable.addAnimation('stand', [0]);

        // set stand as the default animation
        this.renderable.setCurrentAnimation('stand');

        this.data = {
            inverted:false,
            spawnx:this.pos.x,
            spawny:this.pos.y

        }

    },

    /**
     * update the entity
     */
    update : function(dt) {
        // gameplay 
        if(me.input.isKeyPressed('left')) {

            // flip the sprites on h-axis
            this.renderable.flipX(true);

            // update the default force
            this.body.force.x = -this.body.maxVel.x;

            // change the current animation
            if(!this.renderable.isCurrentAnimation('walk'))
                this.renderable.setCurrentAnimation('walk');
        } else if(me.input.isKeyPressed('right')) {
            
            // unflip
            this.renderable.flipX(false);

            // update the default force
            this.body.force.x = this.body.maxVel.x;

            if(!this.renderable.isCurrentAnimation('walk'))
                this.renderable.setCurrentAnimation('walk');
        } else {
            this.body.force.x = 0;
            this.renderable.setCurrentAnimation('stand');
        }

        if(me.input.isKeyPressed('up')) {
                if(this.data.inverted == false) {
                    // flip v-axis
                    this.renderable.flipY(true);
                    // update the default force 
                    this.body.force.y = -this.body.maxVel.y;
                    // update state
                    this.data.inverted = true;
                } else {
                    // flip v-axis
                    this.renderable.flipY(false);
                    // update force
                    this.body.force.y = this.body.maxVel.y;
                    // state
                    this.data.inverted = false;
                }
        }
        
        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function(response, other) {
        // make all other objects solid
        
        // check if j hits a spike, if so move his x,y to the beginning       
        if(other.type == 'Spike' || other.type == 'Enemy') {
            // reset x,y
            this.pos.x = this.data.spawnx;
            this.pos.y = this.data.spawny;

            // reset flip v-axis and force
            this.data.inverted = false;
            this.renderable.flipY(false);
            this.body.force.y = this.body.maxVel.y;
        }
            
        return true;
    }
});

game.EnemyEntity = me.Entity.extend({
    
    init : function(x, y, settings) {
        // constructor
        this._super(me.Entity, 'init', [x, y, settings]);

        // ennemy only moves from top to bot, no x speed
        this.body.setMaxVelocity(0, 2);
        this.body.setFriction(0, 0);

        // always update even if ennemy is outside the screen
        this.alwaysUpdate = true;

        // moving
        this.renderable.addAnimation('move', [0, 1, 2]);

        // set default animation
        this.renderable.setCurrentAnimation('move');

        // initial force y
        var vy = 0;
        while(vy == 0){
            vy = Math.floor(Math.random() * this.body.maxVel.y); 
            vy *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
        }
        this.body.force.y = vy;

    },

    update : function(dt) {
        // apply physics
        this.body.update(dt);

        // collisions
        me.collision.check(this);

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    onCollision : function(response, other) {
        if(other.type == 'EnemyPath')
            this.body.force.y = -this.body.force.y;
        // make all other objects solid
        return true;
    }
});