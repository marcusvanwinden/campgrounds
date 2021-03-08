const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  campground.author = req.user._id;
  campground.images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  console.log(campground);
  await campground.save();
  req.flash('success', 'Successfully created campground');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author',
      },
    })
    .populate('author');
  if (!campground) {
    req.flash('error', 'Cannot find campground');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Cannot find campground');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
  const campground = await Campground.findByIdAndUpdate(
    req.params.id,
    req.body.campground
  );
  campground.images.push(
    ...req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }))
  );
  await campground.save();

  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash('success', 'Successfully updated campground');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  req.flash('success', 'Successfully deleted campground');

  res.redirect('/campgrounds');
};
