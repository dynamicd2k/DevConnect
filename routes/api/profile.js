const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../model/Profile');

//@route    GET profile/me
//@desc     Get current user profile
//@access   Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    POST profile
//@desc     Create or update user profile
//@access   Private

router.post(
  '/',
  auth,
  [
    check('jobrole', 'Job role is required').not().isEmpty(),
    check('skills', 'Skills are required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      jobrole,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //build profile object

    const profilefields = {};

    profilefields.user = req.user.id;
    if (company) profilefields.company = company;
    if (website) profilefields.website = website;
    if (location) profilefields.location = location;
    if (bio) profilefields.bio = bio;
    if (jobrole) profilefields.jobrole = jobrole;
    if (githubusername) profilefields.githubusername = githubusername;

    if (skills)
      profilefields.skills = skills.split(',').map((skills) => skills.trim());

    //Build social object
    profilefields.social = {};
    if (youtube) profilefields.social.youtube = youtube;
    if (facebook) profilefields.social.facebook = facebook;
    if (twitter) profilefields.social.twitter = twitter;
    if (instagram) profilefields.social.instagram = instagram;
    if (linkedin) profilefields.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //Update profile

        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profilefields },
          { new: true }
        );

        return res.json(profile);
      } else {
        //Create
        profile = new Profile(profilefields);
        await profile.save();

        res.json(profile);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
    // res.send('Hello');
  }
);

//@route    GET profile
//@desc     Get all profiles
//@access   Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@route    GET profile/user/:user_id
//@desc     Get profile by user_id
//@access   Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server error');
  }
});

//@route    DELETE profile
//@desc     Delete profile, user and posts
//@access   Private
router.delete('/', auth, async (req, res) => {
  try {
    // todo- remove userposts

    // remove user profile
    await Profile.findOneAndRemove({ user: req.user.id });

    // remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@route    PUT profile/experience
//@desc     Add experience to profile
//@access   Private
router.put(
  '/experience',

  [
    auth,
    [
      (check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty()),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//@route    DELETE profile/experience:exp_id
//@desc     Delete experience from profile
//@access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
